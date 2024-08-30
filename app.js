const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B";
const contractABI = [
    // ABI definition here
    // Add your ABI content as in your original file
    {
        "constant": false,
        "inputs": [
            {
                "name": "_subscriptionFee",
                "type": "uint256"
            }
        ],
        "name": "registerCreator",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_creator",
                "type": "address"
            }
        ],
        "name": "renewSubscription",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_creator",
                "type": "address"
            }
        ],
        "name": "subscribe",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_subscriber",
                "type": "address"
            },
            {
                "name": "_creator",
                "type": "address"
            }
        ],
        "name": "checkSubscription",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "creators",
        "outputs": [
            {
                "name": "creatorAddress",
                "type": "address"
            },
            {
                "name": "subscriptionFee",
                "type": "uint256"
            },
            {
                "name": "subscriberCount",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "subscriptions",
        "outputs": [
            {
                "name": "subscriptionEnd",
                "type": "uint256"
            },
            {
                "name": "isActive",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "subscriptionFee",
                "type": "uint256"
            }
        ],
        "name": "CreatorRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "subscriber",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "endDate",
                "type": "uint256"
            }
        ],
        "name": "NewSubscription",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "subscriber",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newEndDate",
                "type": "uint256"
            }
        ],
        "name": "SubscriptionRenewed",
        "type": "event"
    }
];

let contract;
let signer;

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            document.getElementById("walletAddress").textContent = `Connected: ${accounts[0]}`;
            document.getElementById("walletStatus").textContent = "Wallet Connected";
            document.getElementById("walletStatus").style.color = "green";
            document.getElementById("walletButton").style.display = "none";
            document.getElementById("disconnectButton").style.display = "block";
        } catch (error) {
            console.error("User denied account access", error);
            document.getElementById("walletStatus").textContent = `Connection failed: ${error.message}`;
            document.getElementById("walletStatus").style.color = "red";
        }
    } else {
        console.error("Ethereum provider not found");
        document.getElementById("walletStatus").textContent = "No Ethereum provider found. Please install MetaMask.";
        document.getElementById("walletStatus").style.color = "red";
    }
}

function disconnectWallet() {
    signer = null;
    contract = null;
    document.getElementById("walletAddress").textContent = "";
    document.getElementById("walletStatus").textContent = "Wallet Disconnected";
    document.getElementById("walletStatus").style.color = "orange";
    document.getElementById("walletButton").style.display = "block";
    document.getElementById("disconnectButton").style.display = "none";
}

async function registerCreator() {
    if (contract) {
        const fee = ethers.utils.parseEther(document.getElementById("subscriptionFee").value);
        try {
            await contract.registerCreator(fee);
        } catch (error) {
            console.error("Error registering creator", error);
            alert("Failed to register creator: " + error.message);
        }
    } else {
        alert("Wallet not connected");
    }
}

async function subscribe() {
    if (contract) {
        const creatorAddress = document.getElementById("creatorAddress").value;
        try {
            const creator = await contract.creators(creatorAddress);
            await contract.subscribe(creatorAddress, { value: creator.subscriptionFee });
        } catch (error) {
            console.error("Error subscribing", error);
            alert("Failed to subscribe: " + error.message);
        }
    } else {
        alert("Wallet not connected");
    }
}

async function renewSubscription() {
    if (contract) {
        const creatorAddress = document.getElementById("renewCreatorAddress").value;
        try {
            const creator = await contract.creators(creatorAddress);
            await contract.renewSubscription(creatorAddress, { value: creator.subscriptionFee });
        } catch (error) {
            console.error("Error renewing subscription", error);
            alert("Failed to renew subscription: " + error.message);
        }
    } else {
        alert("Wallet not connected");
    }
}

async function checkSubscription() {
    if (contract) {
        const subscriberAddress = document.getElementById("checkSubscriberAddress").value;
        const creatorAddress = document.getElementById("checkCreatorAddress").value;
        try {
            const isActive = await contract.checkSubscription(subscriberAddress, creatorAddress);
            document.getElementById("subscriptionStatus").textContent = isActive ? "Active" : "Inactive";
        } catch (error) {
            console.error("Error checking subscription", error);
            alert("Failed to check subscription: " + error.message);
        }
    } else {
        alert("Wallet not connected");
    }
}
