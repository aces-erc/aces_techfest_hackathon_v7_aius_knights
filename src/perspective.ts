import axios from "axios";

export const analyzeCommentToxicity = async (text: string) => {
    const apiKey = "AIzaSyDDT9LVuqA71Z7ASp0Tad8HZ3YcST74kxs";
    const url =
        "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze";

    const requestBody = {
        comment: { text },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} },
    };

    try {
        const response = await axios.post(`${url}?key=${apiKey}`, requestBody);
        const score =
            response.data.attributeScores.TOXICITY.summaryScore.value || 0;
        return { toxicityScore: score };
    } catch (error) {
        console.error("Error analyzing toxicity:", error);
        return { toxicityScore: 0 };
    }
};
