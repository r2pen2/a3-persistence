let uid = "";

let emailChanged = false;
let settingChanged = false;

window.onload = () => {
    fetchUserData();
}

function fetchUserData() {
    const userId = new URLSearchParams(window.location.search).get("id");
    fetch("/fetch-user-data?id=" + userId).then((res) => {
        res.json().then((d) => {
            const userData = JSON.parse(d);
            uid = userData.id;
            document.getElementById("user-id").innerHTML = "User ID: " + userData.id;
            document.getElementById("email").innerHTML = "User Email: " + userData.email;
            document.getElementById("save-data").innerHTML = "Save my Game History: " + (userData.saveData ? "true" : "false");
            if (userData.saveData) {
                loadGameHistory(userData.history);
            } else {
                document.getElementById("game-history-list").innerHTML = "User has game history disabled...";
            }
            document.getElementById("delete-account-button").onclick = () => {
                deleteUser();
            }
            document.getElementById("change-email-button").onclick = () => {
                openEmailEdit();
            }
            document.getElementById("change-toggle-button").onclick = () => {
                changeSaveHistory(userData.saveData);
            }
        })
    })
}

async function loadGameHistory(a) {
    const historyList = document.getElementById("game-history-list");
    if (a.length <= 0) {
        historyList.innerHTML = "User hasn't played any games yet."
    } else {
        for (const history of a) {
            console.log(history)
            const card = document.createElement("div");
            card.classList.add("card");
            card.classList.add("data-card");
            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");
            cardHeader.id = "heading" + history.board;
            const h5 = document.createElement("h5");
            h5.classList.add("mb-0");
            const headerButton = document.createElement("button");
            headerButton.classList.add("btn");
            headerButton.classList.add("btn-link");
            headerButton.setAttribute("data-toggle", "collapse");
            headerButton.setAttribute("data-target", "#card" + history.board);
            headerButton.setAttribute("aria-expanded", "true");
            headerButton.setAttribute("aria-controls", "#card" + history.board);
            headerButton.innerHTML = "BoardID: " + history.board;
            const resultLabel = document.createElement("p");
            resultLabel.innerHTML = "Result: " + (history.result ? "✔️" : "❌");
            const deleteLink = document.createElement("button");
            deleteLink.classList.add("btn");
            deleteLink.classList.add("btn-outline-primary");
            deleteLink.innerHTML = "Delete Game Record";
            deleteLink.onclick = () => { 
                deleteHistory(history.board);
            }
            const pWrapper = document.createElement("div");
            pWrapper.appendChild(resultLabel);
            pWrapper.appendChild(deleteLink);
            pWrapper.classList.add("d-flex");
            pWrapper.classList.add("justify-content-between");

            cardHeader.appendChild(h5);
            cardHeader.appendChild(headerButton);
            cardHeader.appendChild(pWrapper);
            card.appendChild(cardHeader);

            const collapse = document.createElement("div");
            collapse.classList.add("collapse");
            collapse.classList.add("show");
            collapse.id = "card" + history.board;
            collapse.setAttribute("aria-labelledby", "heading" + history.board);
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            
            const clicksWrapper = document.createElement("div");
            const clicksLabel = document.createElement("p");
            clicksLabel.innerHTML = "Clicks (" + history.clicks.length + "): ";
            const clicksData = document.createElement("div");
            clicksData.classList.add("d-flex");
            clicksData.classList.add("flex-row");
            clicksData.classList.add("scrolling-row");
            
            for (const click of history.clicks) {
                const clickItem = document.createElement("p");
                clickItem.innerHTML = click.toString() + ", ";
                clicksData.appendChild(clickItem);
            }
            clicksWrapper.appendChild(clicksLabel);
            clicksWrapper.appendChild(clicksData);

            const flagsWrapper = document.createElement("div");
            const flagsLabel = document.createElement("p");
            flagsLabel.innerHTML = "Flags (" + history.flags.length + "): ";
            const flagsData = document.createElement("div");
            flagsData.classList.add("d-flex");
            flagsData.classList.add("flex-row");
            flagsData.classList.add("scrolling-row");
            
            for (const flag of history.flags) {
                const flagItem = document.createElement("p");
                flagItem.innerHTML = flag.toString() + ", ";
                flagsData.appendChild(flagItem);
            }
            flagsWrapper.appendChild(flagsLabel);
            flagsWrapper.appendChild(flagsData);

            cardBody.appendChild(clicksWrapper);
            cardBody.appendChild(flagsWrapper);

            collapse.appendChild(cardBody);
            card.appendChild(collapse);

            historyList.appendChild(card);
        }
    }
}

function deleteHistory(boardId) {
    fetch("/delete-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId: uid, boardId: boardId})
    }).then((res) => {
        res.json().then((d) => {
            if (JSON.parse(d).success) {
                window.location = window.location;
            }
        })
    })
}

function deleteUser() {
    fetch("/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId: uid})
    }).then((res) => {
        res.json().then((d) => {
            if (JSON.parse(d).success) {
                window.location = "/";
            }
        })
    })
}

function openEmailEdit() {
    document.getElementById("email-input-wrapper").classList.add("setting-flex");
    const input = document.getElementById("email-input");
    input.classList.remove("hidden");
    const button = document.getElementById("submit-new-email-button");
    button.classList.remove("hidden");
    button.onclick = () => {
        changeEmail();
    }
}

function changeEmail() {

    const input = document.getElementById("email-input");
    if (input.value.length >= 5 && input.value.includes("@") && input.value.includes(".")) {
            fetch("/change-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({userId: uid, newEmail: input.value})
        }).then((res) => {
            res.json().then((d) => {
                if (JSON.parse(d).success) {
                    window.location = window.location;
                }
            })
        })
    } else {
        input.classList.add("is-invalid");
    }
}

function changeSaveHistory(currentSetting) {

    fetch("/change-save-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId: uid, newSetting: !currentSetting})
    }).then((res) => {
        res.json().then((d) => {
            if (JSON.parse(d).success) {
                window.location = window.location;
            }
        })
    })
}