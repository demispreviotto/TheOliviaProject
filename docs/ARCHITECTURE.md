# 📘 Project Engineering Standards

## 1. Folder Structure & Domain Isolation.

We use a **Feature-Based** approach. Everything required for a specific business domain (User, Billing, Project) stays in one place.

```txt
src/
├── features/
│   └── [feature-name]/
│       ├── api/            # TanStack Query hooks (Server State)
│       ├── components/      # UI components used only in this feature
│       ├── store/          # Zustand stores (Local UI State)
│       ├── utils/          # Feature-specific formatters/helpers
│       ├── [Feature]Page.tsx # Main entry point for the route
│       └── [Feature].styles.ts # Global styles for the feature page
```

## 2. The Styling Pattern (Isolated Emotion).

To keep components clean, we separate styles into a companion `.styles.ts` file using the **Styled-Alias** pattern.

### Naming Convention:

- **File**: `[ComponentName].styles.ts`
- **Export**: Use descriptive names (e.g., `Container`, `Header`, `ActionButton`).
- **Usage**: `Import as \* as S` in the component file.

### Example Structure:

`UserCard.styles.ts`

```ts
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// Use 'styled' to wrap MUI components or raw HTML tags
export const Root = styled(Box)(({ theme }) => ({
	padding: theme.spacing(2),
	border: `1px solid ${theme.palette.divider}`,
}));

export const Title = styled(Typography)({
	fontWeight: 600,
	color: 'primary.main',
});
```

`UserCard.tsx`

```tsx
import \* as S from './UserCard.styles';

export const UserCard = ({ title }: { title: string }) => (
<S.Root>
<S.Title>{title}</S.Title>
</S.Root>
);
```

## 3. State Management Strategy

We follow the **Rule of Three** for state management:

- **Server State (Supabase Data)**: Use **TanStack Query**.
  - **Location**: `features/[feature]/api/use[Name].ts`
- **Global UI State**: Use **Zustand**.
  - Location: `features/[feature]/store/use[Name]Store.ts`
- **Local UI State**: Use standard **useState**.
  - Location: Directly inside the component.

## 5. Naming & Case Conventions

- Folders
  - Pattern: kebab-case
  - Example: user-profile
- Components & Types
  - Pattern: PascalCase
  - Example: `UserCard.tsx`, `UserType.ts`
- Hooks & Functions
- Pattern: camelCase
- Example: `useProfile.ts`, `calculateTotal.ts`
- Styles
  - Pattern: PascalCase (accessed via S.)
  - Example: `S.MainWrapper`
- Constants
  - Pattern: UPPER_SNAKE_CASE
  - Example: API_RETRY_LIMIT

## 5. Supabase & Database Flow

Since we use the CLI, **never** change the schema via the Production Dashboard.

- **Modify**: Use the local Docker Studio (`localhost:54323`).
- **Snapshot**: `npx supabase db diff -f your_change_name`.
- **Verify**: Check the new `.sql` file in `supabase/migrations/`.
- **Sync**: `npx supabase db push` (Only when ready for prod).

## 6. Component File Template

Every new component should follow this structure to remain "Senior Grade":

```ts
// 1. Imports (External -> Internal)
   import { Box } from '@mui/material';
   import \* as S from './MyComponent.styles';

// 2. Types
interface MyComponentProps {
label: string;
}

// 3. Component Definition
export const MyComponent = ({ label }: MyComponentProps) => {
// a. Hooks (State, Queries)
// b. Effects
// c. Handlers

return (
<S.Wrapper>
<S.StyledLabel>{label}</S.StyledLabel>
</S.Wrapper>
);
};
```

## 7. Routing:

- **Rule**: No routes defined inside feature folders. All routes are centralized in `src/routes/`.
- **Reason**: It provides a single source of truth for the app's structure and makes "Protected Route" logic easier to manage globally.
