const base = "http://localhost:7071/api/";

function post(endpt, content) {
    fetch(base + endpt, {
        method: "POST",
        body: JSON.stringify(content)
    });
}

function get(endpt) {
    fetch(base + endpt, {
        method: "GET",
    }).then(response => response.json()).then(data => console.log(data));
}


post("addArticleDirectory", {
    "id": "The Hindu",
    "url": "https://www.thehindu.com/"
});

// get("getArticleDirectories");
