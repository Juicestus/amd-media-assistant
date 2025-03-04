import { Article, ArticleCategory, ArticleDirectory } from "./data";

// Make sure to point the port to localhost
// adb reverse tcp:7071 tcp:7071
// const base = "http://10.0.2.2:7071/api/"; // dev
const base = "https://help-amd-backend.azurewebsites.net/api"; // prod

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
};

export const getArticlePreviews = async (): Promise<Article[]> => {
    return fetch(base + "getAllArticlesPreview", {
        headers: corsHeaders,
    })
        .then(response => response.json())
        .then(data => data as Article[]);
}

export const getArticlePreviewsByCategory = async (category: ArticleCategory): Promise<Article[]> => {
    return fetch(base + "getArticlesPreviewByCategory?category=" + category as string, {
        headers: corsHeaders,
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data as Article[];
        });
}

export const getArticle = async (id: string): Promise<Article> => {
    console.log("Fetching article with id: " + id);
    console.log(base + "getArticleById?id=" + id);

    return fetch(base + "getArticleById?id=" + id, {
        headers: corsHeaders,
    })
        .then(response => response.json())
        .then(data => data as Article);
}