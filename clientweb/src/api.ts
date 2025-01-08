import { Article, ArticleDirectory } from "./data";

const base = "http://localhost:7071/api/";

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

export const getArticleDirectories = async (): Promise<ArticleDirectory[]> => {
    return fetch(base + "getArticleDirectories", {
        headers: corsHeaders,
    })
        .then(response => response.json())
        .then(data => data as ArticleDirectory[]);
}

export const addArticleDirectory = async (name: string, url: string): Promise<void> => {
    return fetch(base + "addArticleDirectory", {
        method: "POST",
        headers: corsHeaders,
        body: JSON.stringify({ id: name, url: url }),
    })
        .then(response => {
            if (!response.ok) {
                alert("Failed to add article directory " + response.text);
            }
        });
}

export const deleteArticleDirectory = async (id: string): Promise<void> => {
    return fetch(base + "deleteArticleDirectory?id=" + id, {
        method: "DELETE",
        headers: corsHeaders,
    })
        .then(response => {
            if (!response.ok) {
                alert("Failed to delete article directory " + response.text);
            }
        });
}

export const getArticlePreviews = async (): Promise<Article[]> => {
    return fetch(base + "getAllArticlesPreview", {
        headers: corsHeaders,
    })
        .then(response => response.json())
        .then(data => data as Article[]);
}

export const getArticle = async (id: string): Promise<Article> => {
    return fetch(base + "getArticleById?id=" + id, {
        headers: corsHeaders,
    })
        .then(response => response.json())
        .then(data => data as Article);
}