import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import { requireAdmin } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { changePasswordSchema, createUserSchema, resetPasswordSchema } from '../schemas.js';

export const usersRouter = Router();

const BCRYPT_COST = 12;

usersRouter.use(requireAdmin);

usersRouter.get('/', async (req, res) => {
    const users = await User.find().sort({ username: 1 }).select('username role createdAt').lean();
    res.json(
        users.map((user) => ({
            id: String(user._id),
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            // Lets the client mark the current row and hide "delete" on it.
            isSelf: String(user._id) === req.adminId,
        })),
    );
});

usersRouter.post('/', async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Skontrolujte vyplnené údaje.' });
        return;
    }

    const { username, password } = parsed.data;
    if (await User.exists({ username })) {
        res.status(409).json({ error: 'Používateľ s týmto menom už existuje.' });
        return;
    }

    const created = await User.create({ username, passwordHash: await bcrypt.hash(password, BCRYPT_COST), role: 'admin' });
    res.status(201).json({ id: String(created._id), username: created.username, role: created.role });
});

usersRouter.patch('/me/password', async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Skontrolujte vyplnené údaje.' });
        return;
    }

    const user = await User.findById(req.adminId);
    if (!user) {
        res.status(401).json({ error: 'Neplatná relácia' });
        return;
    }
    if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
        res.status(401).json({ error: 'Súčasné heslo nesedí.' });
        return;
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
    await user.save();
    res.json({ ok: true });
});

/** Resetting someone else's password; the owner does this when a colleague forgets theirs. */
usersRouter.patch('/:id/password', async (req, res) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success || !isValidObjectId(req.params.id)) {
        res.status(400).json({ error: parsed.success ? 'Neplatné id.' : (parsed.error.issues[0]?.message ?? 'Neplatné heslo.') });
        return;
    }
    if (req.params.id === req.adminId) {
        // Changing your own password must go through the current-password check.
        res.status(400).json({ error: 'Vlastné heslo meňte cez „Zmeniť moje heslo“.' });
        return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({ error: 'Používateľ neexistuje.' });
        return;
    }

    user.passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_COST);
    await user.save();
    res.json({ ok: true });
});

usersRouter.delete('/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Neplatné id.' });
        return;
    }
    if (req.params.id === req.adminId) {
        res.status(400).json({ error: 'Nemôžete zmazať vlastný účet.' });
        return;
    }
    // Locking everyone out of the admin is not a recoverable mistake.
    if ((await User.countDocuments()) <= 1) {
        res.status(400).json({ error: 'Musí zostať aspoň jeden používateľ.' });
        return;
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
        res.status(404).json({ error: 'Používateľ neexistuje.' });
        return;
    }
    res.json({ ok: true });
});
