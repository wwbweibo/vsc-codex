import axios, { AxiosError, AxiosResponse } from "axios";
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
    chatEndpoint = "https://api.openai.com/v1/chat/completions";
    async requestCodeComplete(comment: string, language: string): Promise<string> {
        return await this.requestWithGPTModel(comment);
    }
    async requestCodeExplain(code: string): Promise<string> {
        return await this.requestWithGPTModel(code);
    }

    async general(text: string): Promise<string> {
        return await this.requestWithGPTModel(text);
    }

    async requestWithGPTModel(text: string): Promise<string> {
        text = text.replace(/\/\//g, '');
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
            // 需要处理所有的代码块内容为代码，代码块总是以 ```开头，```结束
            return await this.parseReponseToValidCode(responseContent);
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

    async parseReponseToValidCode(text: string): Promise<string> {
        let idxStart = text.indexOf('```');
        if (idxStart < 0) {
            return text;
        }
        let txt = text.substring(0, idxStart);
        let codeStr = text.substring(idxStart);
        codeStr = codeStr.replace(/```[\w]+\n/, '');
        let idxEnd = codeStr.indexOf('```');
        txt = txt.replace(/\n/g, "\n//");
        let code = codeStr.substring(0, idxEnd);
        // for text left, reinvoke this function
        let remain = codeStr.substring(idxEnd+3);
        if (remain.length === 0) {
            return "";
        }
        let left = await this.parseReponseToValidCode(remain);
        return txt + code + left;
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