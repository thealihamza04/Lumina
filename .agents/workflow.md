# Development Workflow

Follow these rules and conventions when developing features or fixing bugs in this project.

## General Rules
1. **Maintain Quality**: Every feature must match the project's premium design aesthetic.
2. **TypeScript**: Always use TypeScript. Avoid `any` and ensure proper interface/type definitions for all component props and state.
3. **Responsive Design**: Ensure all UI elements work across various screen sizes (though the editor is primarily focused on desktop).
4. **No Placeholders**: Never use placeholder images or text. Generate appropriate assets using available tools.

## Development Process
1. **Code Edits**: Use granular file edits (`multi_replace_file_content` or `replace_file_content`) rather than rewriting entire files.
2. **Testing**: Manual verification is crucial. Use the built-in browser tool to verify UI changes, animations, and responsiveness.
3. **Builds**: Do not run `npm run build` unless explicitly asked or when validating for deployment. Use `npm run dev` for development.

## Documentation
- Keep these `.agents/` instructions updated as the project evolves.
- Document any significant architectural decisions in `architecture.md`.
- Add new design patterns to `design_system.md`.
