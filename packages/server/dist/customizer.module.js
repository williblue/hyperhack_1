"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizerModule = exports.CustomizerGuard = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const fse = require("fs-extra");
const path = require("path");
class CustomizerGuard {
    canActivate(context) {
        return !process.env.NODE_ENV || (process.env.NODE_ENV === 'development');
    }
}
exports.CustomizerGuard = CustomizerGuard;
let CustomizerService = class CustomizerService {
    async info(moduleName) {
        let root = path.join(__dirname, '..', '..', '..');
        let configFile = path.join(root, 'workspace', 'customizer', moduleName, 'customizer.json');
        if (fse.existsSync(configFile)) {
            let config = JSON.parse(fse.readFileSync(configFile, 'utf8'));
            for (let feature in config) {
                config[feature].options.forEach((option) => {
                    let previewPath = path.join(root, 'workspace', 'customizer', moduleName, `${feature}-${option.name}`, 'preview.png');
                    if (fse.existsSync(previewPath)) {
                        var previewImage = fse.readFileSync(previewPath);
                        option.preview = Buffer.from(previewImage).toString('base64');
                    }
                });
            }
            return config;
        }
        else {
            return {};
        }
    }
    async process(moduleName, feature, option) {
        let root = path.join(__dirname, '..', '..', '..');
        let clientRoot = path.join(root, 'packages', 'client', 'src', 'components', moduleName, feature);
        let customizerRoot = path.join(root, 'workspace', 'customizer');
        let dapplibRoot = path.join(root, 'packages', 'dapplib', 'contracts', 'imports', moduleName, feature);
        if (fse.existsSync(path.join(root, 'packages', 'dapplib', 'contracts', 'Project'))) {
            dapplibRoot = path.join(root, 'packages', 'dapplib', 'contracts', 'Project', 'imports');
        }
        let buildRoot = path.join(root, 'packages', 'dapplib', 'build');
        if (fse.existsSync(buildRoot)) {
            fse.removeSync(buildRoot);
        }
        fse.removeSync(clientRoot);
        fse.removeSync(dapplibRoot);
        fse.copySync(path.join(customizerRoot, moduleName, feature + '-' + option), path.join(root, 'packages'));
        return true;
    }
};
CustomizerService = __decorate([
    common_3.Injectable()
], CustomizerService);
let CustomizerController = class CustomizerController {
    constructor(customizerService) {
        this.customizerService = customizerService;
    }
    async info(moduleName) {
        return await this.customizerService.info(moduleName);
    }
    async process(moduleName, feature, option) {
        return await this.customizerService.process(moduleName, feature, option);
    }
};
__decorate([
    common_2.UseGuards(CustomizerGuard),
    common_2.Get('info/:moduleName'),
    __param(0, common_2.Param('moduleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomizerController.prototype, "info", null);
__decorate([
    common_2.UseGuards(CustomizerGuard),
    common_2.Post('process/:moduleName/:feature/:option'),
    __param(0, common_2.Param('moduleName')), __param(1, common_2.Param('feature')), __param(2, common_2.Param('option')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CustomizerController.prototype, "process", null);
CustomizerController = __decorate([
    common_2.Controller('api/customizer'),
    __metadata("design:paramtypes", [CustomizerService])
], CustomizerController);
let CustomizerModule = class CustomizerModule {
};
CustomizerModule = __decorate([
    common_1.Module({
        controllers: [CustomizerController],
        providers: [CustomizerService],
    })
], CustomizerModule);
exports.CustomizerModule = CustomizerModule;
//# sourceMappingURL=customizer.module.js.map