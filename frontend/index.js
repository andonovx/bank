import { web3, provider, web3HttpProvider, atracContract, bankContract } from "./sc.js";

feather.replace()

const connectButton = document.querySelector('.connectButton');
const disconnectButton = document.querySelector('.disconnectButton');
const addressButton = document.querySelector('.addressButton');
const metaMaskButton = document.querySelector('.metaMaskButton');
const walletConnectButton = document.querySelector('.walletConnectButton');
const withdrawButton = document.getElementById('withdrawButton');
const depositButton = document.querySelector('#depositButton');
const wadminButton = document.querySelector('#wadminButton');
const poolButton = document.querySelector('#poolButton');
const poolAmount = document.querySelector('#poolAmount');
const amountInput = document.getElementById('depositAmount');
const notLoggedIn = document.getElementById('notLoggedIn');

let inputValueInSmallestDen;
let connected;
let activeProvider;
let accounntAddress;
let spanload = document.createElement("span");
let r1balance, r2balance, r3balance, totalDeposits, depositCount, adminAddress, startTime, deferral, decimals, balance, allowance, usersDeposits;

spanload.className = "spinner-border spinner-border-sm";
spanload.setAttribute("role", "status");
spanload.setAttribute("aria-hidden", "true");

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

async function loadSemaphoreData() {
    r1balance = await bankContract.methods.rewardPool1Balance().call();
    r2balance = await bankContract.methods.rewardPool2Balance().call();
    r3balance = await bankContract.methods.rewardPool3Balance().call();
    totalDeposits = await bankContract.methods.totalDeposits().call();
    depositCount = await bankContract.methods.depositCount().call();
    adminAddress = await bankContract.methods.adminSafe().call();
    startTime = await bankContract.methods.startTime().call();
    deferral = await bankContract.methods.deferral().call();
    decimals = await atracContract.methods.decimals().call();
}

function setPoolButtonToFill() {
    poolButton.onclick = () => {
        addSpinner(poolButton)
        bankContract.methods.fillThePool(BigInt(inputValueInSmallestDen)).send({ from: accounntAddress })
            .on('receipt', function () {
                removeSpinner(depositButton, "SUCCESS");

                poolButton.classList.add("btn-success");

                setTimeout(() => {
                    poolButton.classList.remove("btn-success");
                    poolButton.innerHTML = "TOP UP POOL";
                    postConnect();
                }, 1000);
            })
            .on('error', function () {
                removeSpinner(poolButton, "FAILURE");

                poolButton.classList.add("btn-danger");

                setTimeout(() => {
                    poolButton.classList.remove("btn-danger");
                    poolButton.innerHTML = "TOP UP POOL";
                    postConnect();
                }, 1000);
            });

    }

    poolButton.innerHTML = "TOP UP POOL";
    poolButton.disabled = false;
}

function setPoolButtonToApprove() {
    poolButton.onclick = () => {
        addSpinner(poolButton)
        atracContract.methods.approve(bankContract._address, BigInt(inputValueInSmallestDen)).send({ from: accounntAddress })
            .on('receipt', function (receipt) {
                setPoolButtonToFill();

                removeSpinner(poolButton, "SUCCESS");

                poolButton.classList.add("btn-success");

                setTimeout(() => {
                    poolButton.classList.remove("btn-success");
                    poolButton.innerHTML = "TOP UP POOL"
                }, 1000);

            })
            .on('error', function () {
                removeSpinner(poolButton, "FAILURE");

                poolButton.classList.add("btn-danger");

                setTimeout(() => {
                    poolButton.classList.remove("btn-danger");
                    poolButton.innerHTML = "Approve Bank to spend your ATRAC";
                    postConnect();
                }, 1000);
            })
    }
    poolButton.innerHTML = "Approve Bank to spend your ATRAC";
    poolButton.disabled = false;
}

function setDepositButtonToDeposit() {
    depositButton.onclick = () => {
        addSpinner(depositButton)
        bankContract.methods.deposit(BigInt(inputValueInSmallestDen)).send({ from: accounntAddress })
            .on('receipt', function () {
                
                removeSpinner(depositButton, "SUCCESS");

                depositButton.classList.add("btn-success");

                setTimeout(() => {
                    depositButton.classList.remove("btn-success");
                    depositButton.innerHTML = "DEPOSIT";
                    postConnect();
                }, 1000);
            })
            .on('error', function () {
                removeSpinner(depositButton, "FAILURE");

                depositButton.classList.add("btn-danger");

                setTimeout(() => {
                    depositButton.classList.remove("btn-danger");
                    depositButton.innerHTML = "DEPOSIT";
                    postConnect();
                }, 1000);
            });

    }

    depositButton.innerHTML = "Deposit";
    depositButton.disabled = false;
}

function setDepositButtonToApprove() {
    depositButton.onclick = () => {
        addSpinner(depositButton)
        atracContract.methods.approve(bankContract._address, BigInt(inputValueInSmallestDen)).send({ from: accounntAddress })
            .on('receipt', function (receipt) {

                setDepositButtonToDeposit();

                removeSpinner(depositButton, "SUCCESS");

                depositButton.classList.add("btn-success");

                setTimeout(() => {
                    depositButton.classList.remove("btn-success");
                    depositButton.innerHTML = "DEPOSIT";
                    postConnect();
                }, 1000);

            })
            .on('error', function () {
                removeSpinner(depositButton, "FAILURE");

                depositButton.classList.add("btn-danger");

                setTimeout(() => {
                    depositButton.classList.remove("btn-danger");
                    depositButton.innerHTML = "Approve Bank to spend your ATRAC";
                    postConnect();
                }, 1000);
            })
    }
    depositButton.innerHTML = "Approve Bank to spend your ATRAC";
    depositButton.disabled = false;
}

window.onload = async function () {
    await loadSemaphoreData();
    document.getElementById("r1balance").innerHTML = r1balance;
    document.getElementById("r2balance").innerHTML = r2balance;
    document.getElementById("r3balance").innerHTML = r3balance;
    document.getElementById("totalDeposits").innerHTML = totalDeposits;
    document.getElementById("depositCount").innerHTML = depositCount;

    let connected = await checkIfConnected();

    if (+Math.floor(Date.now() / 1000) > +startTime + +deferral) {
        depositButton.innerHTML = "DEPOSIT PERIOD HAS PASSED";
        amountInput.disabled = true;

    }

    amountInput.addEventListener('input', async (e) => {
        inputValueInSmallestDen = e.target.value * Math.pow(10, decimals)
        if (+balance >= inputValueInSmallestDen) {
            if (+allowance >= inputValueInSmallestDen) {
                setDepositButtonToDeposit();
            }
            else {
                setDepositButtonToApprove();
            }
        }
        else {
            depositButton.disabled = true;
            depositButton.innerHTML = "You don't have that many ATRAC $";
        }
    });

    poolAmount.addEventListener('input', async (e) => {
        inputValueInSmallestDen = e.target.value * Math.pow(10, decimals)

        if (+balance >= inputValueInSmallestDen) {
            if (+allowance >= inputValueInSmallestDen) {
                setPoolButtonToFill();
            }
            else {
                setPoolButtonToApprove();
            }
        }
        else {
            poolButton.disabled = true;
            poolButton.innerHTML = "You don't have that many ATRAC $";
        }
    });

}

withdrawButton.onclick = () => {
    addSpinner(withdrawButton)
    bankContract.methods.withdraw().send({ from: accounntAddress })
        .on('receipt', function (receipt) {
            let amountWithdrawn = receipt.events["Withdrawn"].returnValues.amountWithdrawn;

            removeSpinner(withdrawButton, "SUCCESSFULLY WITHDRAWN " + amountWithdrawn + " ATRAC");

            withdrawButton.classList.add("btn-success");

            setTimeout(() => {
                withdrawButton.classList.remove("btn-success");
                withdrawButton.innerHTML = "WITHDRAW";
                postConnect();
            }, 10000);

        })
        .on('error', function () {
            removeSpinner(withdrawButton, "FAILURE");

            withdrawButton.classList.add("btn-danger");

            setTimeout(() => {
                withdrawButton.classList.remove("btn-danger");
                withdrawButton.innerHTML = "WITHDRAW";
                postConnect();
            }, 1000);
        })
}

wadminButton.onclick = () => {
    addSpinner(withdrawButton)
    bankContract.methods.withdrawAdmin().send({ from: accounntAddress })
        .on('receipt', function () {
            let amountWithdrawn = receipt.events["Withdrawn"].returnValues.amountWithdrawn;

            removeSpinner(withdrawButton, "SUCCESSFULLY WITHDRAWN " + amountWithdrawn + " ATRAC");

            wadminButton.classList.add("btn-success");

            setTimeout(() => {
                wadminButton.classList.remove("btn-success");
                wadminButton.innerHTML = "DEPOSIT";
                postConnect();
            }, 1000);

        })
        .on('error', function () {
            removeSpinner(withdrawButton, "FAILURE");

            wadminButton.classList.add("btn-danger");

            setTimeout(() => {
                wadminButton.classList.remove("btn-danger");
                wadminButton.innerHTML = "DEPOSIT";
                postConnect();
            }, 1000);
        })
}

async function checkIfConnected(checkOnly) {
    if (Web3.givenProvider.isMetaMask && Web3.givenProvider.selectedAddress != null) {

        if (!checkOnly) {
            await postConnectMetaMask();
        }
        return 1;
    }
    else {
        if (getCookieValue("wc-connected") === "true") {
            if (!checkOnly) {
                await provider.enable();

                await postConnectWalletConnect();
            }
            return 2;
        }

    }
    return 0;
}

async function postConnectMetaMask() {
    activeProvider = Web3.givenProvider;
    web3.setProvider(activeProvider);

    const accounts = await web3.eth.getAccounts();
    accounntAddress = accounts[0];
    connected = true;
    addressButton.innerHTML = accounntAddress;

    addressButton.style.display = "inline";
    connectButton.style.display = "inline";
    connectButton.innerHTML = "Change wallet";
    disconnectButton.style.display = "none";

    await postConnect();
}

async function postConnectWalletConnect() {

    setCookie("wc-connected", "true");

    activeProvider = provider;
    web3.setProvider(activeProvider);

    const accounts = provider.accounts;
    accounntAddress = accounts[0];
    connected = true;
    addressButton.innerHTML = accounntAddress;

    addressButton.style.display = "inline";
    connectButton.style.display = "none";
    disconnectButton.style.display = "inline";

    await postConnect();

}

async function checkNetworkId() {
    if (await web3.eth.getChainId() != 4) {
        alert("Please change the network to Rinkeby");
        return false;
    }
    return true;
}

async function postConnect() {
    balance = await atracContract.methods.balanceOf(accounntAddress).call();
    allowance = await atracContract.methods.allowance(accounntAddress, bankContract._address).call();

    amountInput.disabled = false;

    if (accounntAddress == adminAddress) {

        poolAmount.disabled = false;

        if (depositCount == 0) {

            if (+Math.floor(Date.now() / 1000) > +startTime + 4 * +deferral) {
                wadminButton.disabled = false;
                wadminButton.innerHTML = "WITHDRAW";
            }
        }
        else {
            wadminButton.disabled = true;
            wadminButton.innerHTML = "Some depositors still haven't withdrawn their rewards";
        }
    }
    else {
        wadminButton.disabled = true;
        wadminButton.innerHTML = "You are not the admin";

        poolAmount.disabled = true;
        poolButton.innerHTML = "You are not the admin";

    }

    if (+Math.floor(Date.now() / 1000) > +startTime + 2 * +deferral) {
        poolAmount.disabled = true;
        poolButton.innerHTML = "Withdraw period has started";
    }

    usersDeposits = await bankContract.methods.deposits(accounntAddress).call();

    if (usersDeposits > 0) {
        if (+Math.floor(Date.now() / 1000) > +startTime + 2 * +deferral || +Math.floor(Date.now() / 1000) < +startTime + +deferral) {
            withdrawButton.disabled = false;
            withdrawButton.innerHTML = "WITHDRAW";
        }
        else {
            withdrawButton.disabled = true;
            withdrawButton.innerHTML = "Locking period has not yet passed";
        }
    }
    else {
        withdrawButton.disabled = true;
        withdrawButton.innerHTML = "You don't have any deposits";
    }
    notLoggedIn.style.display = "none";

}

async function disconnect() {

    if (await checkIfConnected() == 2) {
        await provider.disconnect();
        setCookie("wc-connected", "false");

        accounntAddress = null;
        connected = false;
        activeProvider = null;
        addressButton.innerHTML = "";
    }
    if (await checkIfConnected() == 0) {
        web3.setProvider(web3HttpProvider);
        connectButton.innerHTML = "Connect wallet";
        connectButton.style.display = "inline";
        disconnectButton.style.display = "none";
        addressButton.style.display = "none";
        document.getElementById("withdrawLi").style.display = "none";
    }
}

metaMaskButton.addEventListener('click', async () => {

    if (ethereum.isMetaMask) {

        let prevInnerHTML = metaMaskButton.innerHTML;
        addSpinner(metaMaskButton);
        walletConnectButton.disabled = true;

        await ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {}, }] });

        if (await checkNetworkId())
            await postConnectMetaMask();

        $('#connectModal').modal('hide');

        removeSpinner(metaMaskButton, prevInnerHTML);
        walletConnectButton.disabled = false;

    }
    else {
        alert("Please install MetaMask");
        $('#connectModal').modal('hide');
    }

});

walletConnectButton.addEventListener('click', async () => {
    await provider.enable();

    if (await checkNetworkId())
        postConnectWalletConnect();

    $('#connectModal').modal('hide');
});

disconnectButton.addEventListener('click', async () => {
    disconnect();
});

provider.on("accountsChanged", (accounts) => {
    postConnectWalletConnect();
});

provider.on("chainChanged", async (chainId) => {
    if (await checkNetworkId()) {
        postConnectWalletConnect();
    }
});

provider.on("disconnect", (code, reason) => {
    disconnect();
});

Web3.givenProvider.on("accountsChanged", (accounts) => {
    checkIfConnected(true) == 1 ? postConnectMetaMask() : disconnect()
});

Web3.givenProvider.on("chainChanged", async (chainId) => {
    if (await checkNetworkId()) {
        postConnectMetaMask();
    }
});

Web3.givenProvider.on("disconnect", (code, reason) => {
    checkIfConnected(true) == 1 ? postConnectMetaMask() : disconnect()
});

function addSpinner(btn) {
    btn.innerHTML = "";
    btn.appendChild(spanload);
    btn.disabled = true;
}

function removeSpinner(btn, innerHtml) {
    btn.innerHTML = innerHtml;
    btn.disabled = false;
}

$(function () {

    var newHash = "",
        $mainContent = $("#maindiv"),
        $pageWrap = $("#page-wrap"),
        baseHeight = 0,
        $el;

    let overviewSection = document.getElementById("overview");
    let depositSection = document.getElementById("deposit");
    let withdraw = document.getElementById("withdraw");
    let wadmin = document.getElementById("wadmin");
    let pool = document.getElementById("pool");

    $pageWrap.height($pageWrap.height());
    baseHeight = $pageWrap.height() - $mainContent.height();

    $("nav").delegate("a", "click", function () {
        window.location.hash = $(this).attr("href");
        return false;
    });

    $(window).bind('hashchange', function () {

        newHash = window.location.hash.substring(1);

        if (newHash) {

            $mainContent
                .fadeOut(500, function () {
                    if (newHash === "home") {
                        $mainContent.fadeOut(500, function () {
                            $mainContent.fadeIn(500, function () { });
                        });
                        $("nav a").removeAttr("aria-current");
                        $("nav a").removeClass("active");

                        $("nav a[href=#" + newHash + "]").attr("aria-current", "page");
                        $("nav a[href=#" + newHash + "]").addClass("active");

                        overviewSection.style.display = "block";
                        depositSection.style.display = "none";
                        withdraw.style.display = "none";
                        wadmin.style.display = "none";
                        pool.style.display = "none";

                        $mainContent.fadeIn(500, () => { });
                    }
                    else if (newHash === "deposit") {
                        $("nav a").removeAttr("aria-current");
                        $("nav a").removeClass("active");
                        $("nav a[href=#" + newHash + "]").attr("aria-current", "page");
                        $("nav a[href=#" + newHash + "]").addClass("active");

                        overviewSection.style.display = "none";
                        depositSection.style.display = "block";
                        withdraw.style.display = "none";
                        wadmin.style.display = "none";
                        pool.style.display = "none";

                        $mainContent.fadeIn(500, () => { });
                    }
                    else if (newHash === "withdraw") {
                        $("nav a").removeAttr("aria-current");
                        $("nav a").removeClass("active");
                        $("nav a[href=#" + newHash + "]").attr("aria-current", "page");
                        $("nav a[href=#" + newHash + "]").addClass("active");

                        overviewSection.style.display = "none";
                        depositSection.style.display = "none";
                        withdraw.style.display = "block";
                        wadmin.style.display = "none";
                        pool.style.display = "none";

                        $mainContent.fadeIn(500, () => { });
                    }
                    else if (newHash === "wadmin") {
                        $("nav a").removeAttr("aria-current");
                        $("nav a").removeClass("active");
                        $("nav a[href=#" + newHash + "]").attr("aria-current", "page");
                        $("nav a[href=#" + newHash + "]").addClass("active");

                        overviewSection.style.display = "none";
                        depositSection.style.display = "none";
                        withdraw.style.display = "none";
                        wadmin.style.display = "block";
                        pool.style.display = "none";

                        $mainContent.fadeIn(500, () => { });
                    }
                    else if (newHash === "pool") {
                        $("nav a").removeAttr("aria-current");
                        $("nav a").removeClass("active");
                        $("nav a[href=#" + newHash + "]").attr("aria-current", "page");
                        $("nav a[href=#" + newHash + "]").addClass("active");

                        overviewSection.style.display = "none";
                        depositSection.style.display = "none";
                        withdraw.style.display = "none";
                        wadmin.style.display = "none";
                        pool.style.display = "block";

                        $mainContent.fadeIn(500, () => { });
                    }

                });
        };

    });

    $(window).trigger('hashchange');

});