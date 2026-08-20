# Claude Code Instructions

## Stack

-   **Framework**: React (functional components, hooks only — no class components)
-   **Language**: TypeScript with strict mode enabled
-   **Styling**: LESS with global variables and nesting
-   **State**: Redux Toolik if will be needed for complex state management, otherwise local component state with `useState`

---

## Component Architecture

### Always prefer small, reusable components

-   If a JSX block is used more than once — or could reasonably be used elsewhere — extract it into its own component immediately.
-   A component should do **one thing**. If you find yourself describing a component with "and", split it.
-   Keep components under ~150 lines. If a `.tsx` file is growing beyond that, treat it as a signal to refactor.
-   Co-locate component files: `ComponentName/index.tsx`, `ComponentName/ComponentName.module.less`, `ComponentName/ComponentName.helpers.ts`.

### Naming conventions

-   Components: `PascalCase`
-   Helper functions, hooks, utilities: `camelCase`
-   LESS variables: `@kebab-case`
-   Files: `PascalCase` for components, `camelCase` for helpers and hooks

### Named exports only

```ts
// ✅ correct
export const UserCard = () => { ... }

// ❌ avoid
export default function UserCard() { ... }
```

---

## TypeScript Rules

-   Always type props explicitly — never use `any`.
-   Define prop types with `interface`, not `type`, for components.
-   Use `type` for unions, mapped types, and utility types.
-   Never suppress TypeScript errors with `// @ts-ignore` — fix the root cause.
-   Avoid optional chaining as a lazy workaround for missing type guards.

```ts
// ✅ correct
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ❌ avoid
const Button = (props: any) => { ... }
```

---

## React Best Practices

### Hooks

-   Never call hooks conditionally or inside loops.
-   Extract complex hook logic into a custom hook in `/hooks/useXxx.ts`.
-   `useEffect` must always have an explicit dependency array — never omit it.
-   Avoid overusing `useEffect` — prefer derived state and event handlers where possible.

### Performance

-   Memoize expensive computations with `useMemo`.
-   Wrap callbacks passed as props with `useCallback` to prevent unnecessary re-renders.
-   Use `React.memo` on pure presentational components that receive stable props.
-   Never create functions or objects inline in JSX props unless they're trivial.

```tsx
// ❌ avoid — creates new reference on every render
<Button onClick={() => handleClick(id)} />;

// ✅ correct
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleButtonClick} />;
```

### State

-   Keep state as local as possible — lift only when needed.
-   Prefer multiple focused `useState` calls over one large state object, unless the state is logically coupled.
-   Never mutate state directly.

---

## Helper Files

-   If a function is longer than ~20 lines or handles business logic (formatting, calculations, transformations, API mapping), move it to a `*.helpers.ts` or `*.utils.ts` file.
-   Group helpers by domain, not by file they were extracted from.
-   Always export helpers as named functions — not arrow functions assigned to `const` — so they appear correctly in stack traces.
-   Pure helper functions must have no side effects and should be independently testable.

```
src/
  components/
    UserCard/
      UserCard.tsx       ← formatting, logic
      UserCard.less
  hooks/
    useUserData.ts              ← data fetching logic
  utils/
    date.ts               ← shared date helpers
    string.ts
```

---

## LESS / Styling Rules

### Always use variables from `global.less`

-   **Never hardcode** color values, font families, font sizes, border radii, spacing, or z-index values.
-   All design tokens must reference variables defined in `global.less`.
-   If a value is used more than once and doesn't have a variable, define one in `global.less`.

```less
// ❌ avoid
.card {
    background: #ffffff;
    font-family: 'Inter', sans-serif;
    border-radius: 8px;
}

// ✅ correct
.card {
    background: @color-background;
    font-family: @font-primary;
    border-radius: @border-radius-md;
}
```

### Always take care of responsibility for tablets and mobile devices

-   Always use media queries to ensure components are responsive and look good on all screen sizes.

### Always use nesting

-   LESS supports nesting — use it. Flat selectors are forbidden unless targeting a global reset or third-party override.
-   Nest pseudo-classes, pseudo-elements, modifiers, and child elements within the parent block.
-   Use `&` for modifier classes and state variants.

```less
// ✅ correct
.card {
    background: @color-surface;
    padding: @spacing-md;

    &:hover {
        background: @color-surface-hover;
    }

    &--active {
        border: 1px solid @color-primary;
    }

    &__title {
        font-size: @font-size-lg;
        font-weight: @font-weight-bold;
        color: @color-text-primary;
    }

    &__body {
        color: @color-text-secondary;
        margin-top: @spacing-sm;
    }
}
```

### Class naming

-   Follow BEM: `block__element--modifier`
-   Keep class names semantic — describe what the element **is**, not how it looks

---

## Refactoring Guidelines

When you encounter a large or complex file, proactively suggest or apply the following:

1. **Extract repeated JSX** → new component
2. **Extract logic from component body** → custom hook or helper file
3. **Split a large component** → parent + focused child components
4. **Inline styles or hardcoded values** → LESS variables
5. **Overloaded `useEffect`** → split into separate effects or dedicated hooks

If a `.tsx` file exceeds ~150 lines, flag it and propose a refactoring plan before adding more code.

---

## What to Avoid

-   Class components
-   `any` type
-   Hardcoded colors, fonts, or spacing values
-   Inline styles (use LESS classes)
-   Direct DOM manipulation outside of refs
-   Nested ternaries in JSX (extract to a variable or subcomponent)
-   `useEffect` without dependency arrays
-   Default exports for components
-   Commented-out dead code — delete it
