## Maintainer List

{MAINTAINERS}

## For New Translators

To translate a page:

1. Check that no one else has claimed your page in the checklist and comments below.
2. Comment below with the name of the page you would like to translate. **Please take only one page at a time**.
3. Clone this repo, translate your page, and submit a pull request!

Before contributing, read the glossary and style guide (once they exist) to understand how to translate various technical and React-specific terms.

Please be prompt with your translations! If you find that you can't commit anymore, let the maintainers know so they can assign the page to someone else.

## For Maintainers

When someone volunteers, edit this issue with the username of the volunteer, and with the PR. Ex:

```
- [ ] Quick Start (@tesseralis) #12345
```

When PRs are merged, make sure to mark that page as completed like this:

```
- [x] Quick Start (@tesseralis) #12345
```

This ensures your translation's progress is tracked correctly at https://translations.react.dev/.

## Main Content <!-- MAIN_CONTENT -->

To do before releasing as an "official" translation. **Please translate these pages first.**

Note that each section has an index page, which needs to be translated too.

### Learn React

- [ ] Quick Start
  - [ ] Tutorial: Tic Tac Toe
  - [ ] Thinking in React
  
- [ ] Installation
  - [ ] Start a New React Project
  - [ ] Add React to an Existing Project
  - [ ] Editor Setup
  - [ ] React Developer Tools
  
- [ ] Describing the UI
  - [ ] Your First Component
  - [ ] Importing and Exporting Components
  - [ ] Writing Markup with JSX
  - [ ] JavaScript in JSX with Curly Braces
  - [ ] Passing Props to a Component
  - [ ] Conditional Rendering
  - [ ] Rendering Lists
  - [ ] Keeping Components Pure
  
- [ ] Adding Interactivity
  - [ ] Responding to Events
  - [ ] State: A Component's Memory
  - [ ] Render and Commit
  - [ ] State as a Snapshot
  - [ ] Queueing a Series of State Updates
  - [ ] Updating Objects in State
  - [ ] Updating Arrays in State
  
- [ ] Managing State
  - [ ] Reacting to Input with State
  - [ ] Choosing the State Structure
  - [ ] Sharing State Between Components
  - [ ] Preserving and Resetting State
  - [ ] Extracting State Logic into a Reducer
  - [ ] Passing Data Deeply with Context
  - [ ] Scaling Up with Reducer and Context
  
- [ ] Escape Hatches
  - [ ] Referencing Values with Refs
  - [ ] Manipulating the DOM with Refs
  - [ ] Synchronizing with Effects
  - [ ] You Might Not Need an Effect
  - [ ] Lifecycle of Reactive Effects
  - [ ] Separating Events from Effects
  - [ ] Removing Effect Dependencies
  - [ ] Reusing Logic with Custom Hooks

### API Reference

- [ ] `react`: Hooks
  - [ ] `useCallback`
  - [ ] `useContext`
  - [ ] `useDebugValue`
  - [ ] `useDeferredValue`
  - [ ] `useEffect`
  - [ ] `useId`
  - [ ] `useImperativeHandle`
  - [ ] `useInsertionEffect`
  - [ ] `useLayoutEffect`
  - [ ] `useMemo`
  - [ ] `useReducer`
  - [ ] `useRef`
  - [ ] `useState`
  - [ ] `useSyncExternalStore`
  - [ ] `useTransition`

- [ ] `react`: Components
  - [ ] `<Fragment> (<>)`
  - [ ] `<Profiler>`
  - [ ] `<StrictMode>`
  - [ ] `<Suspense>`

- [ ] `react`: APIs
  - [ ] `createContext`
  - [ ] `forwardRef`
  - [ ] `lazy`
  - [ ] `memo`
  - [ ] `startTransition`

- [ ] `react-dom`: Components
  - [ ] Common (e.g. `<div>`)
  - [ ] `<input>`
  - [ ] `<option>`
  - [ ] `<progress>`
  - [ ] `<select>`
  - [ ] `<textarea>`

- [ ] `react-dom`: APIs
  - [ ] `createPortal`
  - [ ] `flushSync`
  - [ ] `findDOMNode`
  - [ ] `hydrate`
  - [ ] `render`
  - [ ] `unmountComponentAtNode`

- [ ] `react-dom/client`: Client APIs
  - [ ] `createRoot`
  - [ ] `hydrateRoot`

- [ ] `react-dom/server`: Server APIs
  - [ ] `renderToNodeStream`
  - [ ] `renderToPipeableStream`
  - [ ] `renderToReadableStream`
  - [ ] `renderToStaticMarkup`
  - [ ] `renderToStaticNodeStream`
  - [ ] `renderToString`

### Navigation and UI

We suggest to leave *most* of the UI translation until the end. We plan to do some invasive changes to the website folder layout and components, so postponing this until your translation is almost complete would make it easier to merge the changes from our side later. It might make sense to translate the homepage above the fold early, but leave the rest for later. As individual pages get translated, you can change the page titles in the corresponding sidebar files. Finally, when you're translating the navigation, make sure to test both desktop and mobile layouts.

- [ ] Homepage (currently in `HomeContent.js`)
- [ ] Sidebars (currently in `src/sidebar*.json`)
- [ ] Top-level navigation (currently in `TopNav.tsx`)

### When You're Ready...

After everything above is translated, add your language to `deployedLanguages` in `Seo.tsx` of the original [reactjs/react.dev](https://github.com/reactjs/react.dev) repository.

## Secondary Content <!-- SECONDARY_CONTENT -->

These API pages should ideally be translated too, but they're less urgent and can be done after the others:

- [ ] Legacy React APIs
  - [ ] `Children`
  - [ ] `cloneElement`
  - [ ] `Component`
  - [ ] `createElement`
  - [ ] `createFactory`
  - [ ] `createRef`
  - [ ] `isValidElement`
  - [ ] `PureComponent`

## Optional Content <!-- OPTIONAL_CONTENT -->

These aren't the main translation targets, but if you'd like to do them, feel free to expand the list to include their subpages:

- [ ] Community
- [ ] Blog
- [ ] Warnings
