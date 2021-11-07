import { DappService } from './dapp.service';
export declare class DappController {
    private readonly dappService;
    constructor(dappService: DappService);
    sample(greeting: string): Promise<string>;
}
