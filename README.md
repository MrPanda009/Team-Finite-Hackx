# ReliefChain

Relief Chain is a blockchain-powered platform designed to bring complete transparency and accountability to disaster aid distribution. It leverages smart contracts and an immutable ledger to track every donation, verify every delivery, and ensure relief reaches those who need it most.

## Key Features

-   **Immutable Blockchain Ledger**: Every aid movement, from donor to beneficiary, is recorded on the blockchain with cryptographic verification.
-   **Transparency Dashboard**: A real-time dashboard for donors, auditors, and the public to track fund usage and the status of relief deliveries.
-   **Automated Smart Contracts**: Funds are automatically released upon the verified completion of delivery milestones, ensuring accountability.
-   **Role-Based Access**: Secure and distinct permissions for NGOs, government agencies, auditors, and donors, complete with auditable trails.

## How It Works

AidChain ensures end-to-end transparency through a simple, verifiable process:

1.  **Donation Recorded**: When a donation is made, the funds are received and immediately logged on the blockchain, activating a smart contract that governs their release.
2.  **Aid Procurement & Transit**: As aid is procured and moves through the supply chain, each milestone is verified by independent auditors and recorded immutably on the ledger.
3.  **Verified Delivery**: Upon final delivery confirmation, the smart contract automatically releases funds to the relevant parties and updates all stakeholders in real-time.

## Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Blockchain Interaction**: [Ethers.js](https://ethers.io/)
-   **Authentication & Database**: [Supabase](https://supabase.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Web3 wallet extension, like [MetaMask](https://metamask.io/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/mrpanda009/team-finite-hackx.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd team-finite-hackx
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

### Environment Configuration

Create a `.env.local` file in the root of the project and add the following environment variables.

```
# Smart Contract Configuration (defaults to Sepolia testnet)
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_CONTRACT_ADDRESS>
NEXT_PUBLIC_CHAIN_ID=11155111

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<YOUR_SUPABASE_PUBLISHABLE_KEY>
```

You can find the contract address and ABI in `config/contract.ts`.

### Running the Application

Once the dependencies are installed and the environment variables are set, run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

The repository is organized as follows:

-   `app/`: Contains all pages and layouts for the Next.js App Router.
-   `components/`: Reusable React components built with shadcn/ui.
-   `config/`: Smart contract configuration, including ABI, address, roles, and stage definitions.
-   `contexts/`: Global React contexts for managing Web3 state (`Web3Context`) and user authentication (`AuthContext`).
-   `hooks/`: Custom hooks for interacting with the smart contract (`useContractData`) and other utilities.
-   `integrations/`: Contains the Supabase client and generated TypeScript types.
-   `lib/`: Core utility functions, such as `cn` for class names.