# Aave V3 Borrowing Rates

This React application displays the current borrowing rates for various assets on the Aave V3 protocol.

## Features

- Connect to MetaMask wallet
- Display current borrowing rates for multiple assets
- Auto-refresh data on new Ethereum blocks
- Manual refresh option
- Responsive design for mobile and desktop

## Installation

1. Clone the repository:
https://github.com/vinhphamdev/aave-borrowing-rates

2. Install dependencies:
npm install

3. Start the development server:
npm start


4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How it works

The application uses ethers.js to interact with the Ethereum blockchain and the Aave V3 smart contract. It fetches the current borrowing rates for various assets and displays them in a table format.

Key components:
- Wallet connection using MetaMask
- Fetching data from the Aave V3 smart contract
- Auto-refreshing data on new blocks
- Responsive UI using Tailwind CSS

## Challenges faced

1. **ABI Integration**: Finding and integrating the correct ABI for the Aave V3 contract was challenging. Ensure you're using the most up-to-date ABI.

2. **Rate Calculation**: The borrowing rates returned by the contract are in ray units (1e27). We needed to convert these to percentages for display.

3. **Auto-refresh Optimization**: Implementing auto-refresh on new blocks while avoiding excessive API calls required careful debouncing.

4. **Mobile Responsiveness**: Ensuring the UI looks good on both desktop and mobile required careful CSS adjustments.

## Future Improvements

- Add support for more assets
- Implement error handling for network issues
- Add unit tests for components and functions