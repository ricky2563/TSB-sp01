# SP01 Dodge Game

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Game Description

This is a simple React-based game where a character (SP01) moves between two lanes (`top` and `bottom`) to avoid incoming obstacles (referred to as "boias"). The game increases in difficulty as the score increases, with faster obstacle speeds and spawning rates.

## Gameplay Instructions

- **Start the Game**: Press `Space` to start the game.
- **Move SP01**: Press `Space` to toggle SP01 between the `top` and `bottom` lanes. Use `ArrowUp` to move SP01 to the `top` and `ArrowDown` to move SP01 to the `bottom`.
- **Pause**: Press `Escape` to pause the game.
- **Reset**: Press `R` to restart the game after it ends.

## Project Structure

- **`SP01.tsx`**: Component representing the main character.
- **`SP01.css`**: Style for the main character.
- **`Boia.tsx`**: Component representing each obstacle.
- **`Boia.css`**: Style for each obstacle.
- **`Game.tsx`**: Main game logic and components integration.
- **`Game.css`**: Styles for layout.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
For more information on running tests, refer to the [Create React App documentation](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`

Builds the app for production in the `build` folder.\
It optimizes the build for the best performance and bundles React in production mode. The build is minified, and filenames include hashes for caching.

For deployment information, see the [Create React App deployment guide](https://facebook.github.io/create-react-app/docs/deployment).

### `npm run eject`

**Warning: This is a one-way operation. Once you `eject`, you cannot revert!**

If you need more control over the build configuration, `eject` will copy configuration files and dependencies into your project. While all other commands will continue to work, they will point to the copied scripts for easy customization.

## Learn More

- [React documentation](https://reactjs.org/)
- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)

Enjoy the game, and happy coding!

## Game Deployed At

Check out the live game here: [Deployed Game Link](https://web.tecnico.ulisboa.pt/ist1103555/)

