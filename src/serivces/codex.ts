import axios, { AxiosError, AxiosResponse } from "axios";
import * as vscode from "vscode";

export default class CodexClient {
    apiKey: string;
    generateMaxToken: number;
    explainMaxToken: number;
    model: string;
    constructor(model: string, apiKey: string, generateMaxToken: number, explainMaxToken: number) {
        this.model = model;
        this.apiKey = apiKey;
        this.generateMaxToken = generateMaxToken;
        this.explainMaxToken = explainMaxToken;
    }
    completeEndpoint = "https://api.openai.com/v1/completions";
    async requestCodeComplete(comment: string, language: string): Promise<string> {
        let result = "";
        let request = {
            "prompt": "// " + language + "\n" + comment,
            "max_tokens": this.generateMaxToken,
            "temperature": 0,
            "model": this.model,
        };
        return await this.requestOpenAi(request);
    }
    async requestCodeExplain(code: string): Promise<string> {
        let reqeust = {
            "prompt": code + "\n" + "// 上面这段代码是什么意思",
            "max_tokens": this.explainMaxToken,
            "temperature": 0.1,
            "model": this.model,
        };
        return await this.requestOpenAi(reqeust);
    }

    async general(text: string): Promise<string> {
        let reqeust = {
            "prompt": text,
            "max_tokens": this.explainMaxToken,
            "temperature": 0.1,
            "model": this.model,
        };
        return await this.requestOpenAi(reqeust);
    }

    private async requestOpenAi(requestData: object): Promise<string> {
        try {
            let resp = await axios({
                method: "POST",
                data: requestData,
                url: this.completeEndpoint,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.apiKey
                },
                timeout: 60000
            });
            if (resp.status === 200) {
                return resp.data.choices[0].text;
            }
        }
        catch (err: any) {
            let errmessage = err.toString();
            if (err instanceof AxiosError) {
                await vscode.window.showErrorMessage( errmessage + "\n" + JSON.stringify((err as AxiosError).response?.data));
            } else {
                await vscode.window.showErrorMessage(errmessage);
            }
        }
        return "";
    }
} 