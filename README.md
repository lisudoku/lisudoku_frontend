# lisudoku frontend

https://lisudoku.xyz

<img width="1082" alt="Screenshot 2023-01-24 at 00 05 37" src="https://user-images.githubusercontent.com/6545554/214160491-e2b6b810-21ca-457b-a0cd-bba67bd2c5b7.png">

This is lisudoku's frontend written in React that connects to the Rails [backend](https://github.com/lisudoku/lisudoku_backend).

10 supported sudoku variants.

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
