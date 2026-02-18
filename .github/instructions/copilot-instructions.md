---
applyTo: "**"
---
Before starting implementing new features in the back-end ,always consult with Next.js expert to ensure that your implementation aligns with the best practices and architectural decisions of the project. This will help avoid potential issues and ensure that your code integrates smoothly with the existing codebase.

For docker and containerization related tasks, always refer to the [containerization-docker-best-practices.instructions.md](.github/instructions/containerization-docker-best-practices.instructions.md) for guidance on how to properly set up and configure your Docker environment. This will help ensure that your containerized applications are efficient, secure, and maintainable.

Always after ,you complete a task, review the code for adherence to the project's coding guidelines and best practices. Ensure that your code is clean, well-documented, and follows the established conventions for naming, formatting, and structure. This will help maintain code quality and consistency across the project. And also do the verification below:

## Verification

1. **Build check**: Run `npm run build` - should complete without errors
2. **Dev server**: Run `npm run dev` - homepage renders at `localhost:3000`
3. **TypeScript**: Run `npx tsc --noEmit` - no type errors
4. **Lint**: Run `npm run lint` - passes ESLint
5. **Chess board**: Interactive board renders and accepts drag-drop move