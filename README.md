# lisudoku frontend

https://lisudoku.xyz

<img width="846" alt="Screenshot 2023-03-07 at 15 25 02" src="https://user-images.githubusercontent.com/6545554/223435209-8877f41c-322e-4134-a415-20a3763f7c7f.png">

This is lisudoku's frontend written in React that connects to the Rails [backend](https://github.com/lisudoku/lisudoku_backend).

Main features
1. 12 supported sudoku variants
2. Multiple grid sizes (4x4, 6x6, 9x9)
3. Watch other solvers play live
4. Get hints when you're stuck
5. Use the Trainer to improve your technique
6. Build puzzles and run the solver on any puzzle
7. Share the puzzle you built and others can solve it
8. Solve or run the solver on puzzles imported from f-puzzles
9. No account required
10. Also works offline!

## Contribute

Contributions are welcome! You can contribute by writing code, providing UI designs, or any idea that can improve lisudoku.

Join the [discord server](https://discord.gg/SGV8TQVSeT).

## Setup

1. Clone the repo
2. Make sure you have node installed. Check `.nvmrc` for the needed version or just use nvm.
3. `yarn install`
4. Create `.env.local` with the following content
```
REACT_APP_API_BASE_URL=http://localhost:3000
```
5. Start the app with `yarn start` (make sure the [backend](https://github.com/lisudoku/lisudoku_backend) is running)

## Deployment

The frontend is deployed on [netlify.com](https://www.netlify.com).

Deployment command: `yarn deploy`
