import axios, { AxiosError, AxiosResponse } from "axios";
import { stringify } from "querystring";
import { json } from "stream/consumers";
import { runInThisContext } from "vm";
import * as vscode from "vscode";

export default class CodexClient {
    apiKey: string;
    maxToken: number;
    model: string;
    timeout: number;
    constructor(model: string, apiKey: string, maxToken: number, timeout: number) {
        this.model = model;
        this.apiKey = apiKey;
        this.maxToken = maxToken;
        this.timeout = timeout;
    }
    completeEndpoint = "https://api.openai.com/v1/completions";
    chatEndpoint = "https://api.openai.com/v1/chat/completions";
    async requestCodeComplete(comment: string, language: string): Promise<string> {
        if (this.model === "gpt-3.5-turbo") {
            return await this.requestWithGPTModel(comment);
        }
        else {
            let request = {
                "prompt": "// " + language + "\n" + comment,
                "max_tokens": this.maxToken,
                "temperature": 0,
                "model": this.model,
            };
            return await this.requestCodexModel(request);
        }
    }
    async requestCodeExplain(code: string): Promise<string> {
        if (this.model === "gpt-3.5-turbo") {
            return await this.requestWithGPTModel(code);
        }
        else {
            let reqeust = {
                "prompt": code + "\n" + "// 上面这段代码是什么意思",
                "max_tokens": this.maxToken,
                "temperature": 0.1,
                "model": this.model,
            };
            return await this.requestCodexModel(reqeust);
        }
    }

    async general(text: string): Promise<string> {
        if (this.model === "gpt-3.5-turbo") {
            return await this.requestWithGPTModel(text);
        } else {
            let reqeust = {
                "prompt": text,
                "max_tokens": this.maxToken,
                "temperature": 0.1,
                "model": this.model,
            };
            return await this.requestCodexModel(reqeust);
        }
    }

    async requestWithGPTModel(text: string): Promise<string> {
        try {
            let reqeust = {
                "messages": [
                    {
                        "role": "system",
                        "content": "you are a veteran coder."
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                "model": this.model,
            };
            let response = await this.requestOpenAi(reqeust, this.chatEndpoint);
            let responseContent = response.data.choices[0].message.content as string;
            return "\n//" + responseContent.replace("\n\n", "\n\n//");
        } catch (err:any) {
            let errmessage = err.toString();
            if (err instanceof AxiosError) {
                await vscode.window.showErrorMessage(errmessage + "\n" + JSON.stringify((err as AxiosError).response?.data));
            } else {
                await vscode.window.showErrorMessage(errmessage);
            }
            return "";
        }
    }

    async requestCodexModel(request: object): Promise<string> {
        try{
            let response = await this.requestOpenAi(request, this.completeEndpoint);
            return response.data.choices[0].text;
        } catch(err: any) {
            let errmessage = err.toString();
            if (err instanceof AxiosError) {
                await vscode.window.showErrorMessage( errmessage + "\n" + JSON.stringify((err as AxiosError).response?.data));
            } else {
                await vscode.window.showErrorMessage(errmessage);
            }
            return "";
        }

    }

    private async requestOpenAi(requestData: object, url: string): Promise<AxiosResponse> {
        return await axios({
            method: "POST",
            data: requestData,
            url: url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.apiKey
            },
            timeout: this.timeout
        });
    }
} 