"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        preflightContinue: false
    });
    const options = new swagger_1.DocumentBuilder()
        .setTitle('DappStarter API')
        .setDescription('Full-Stack Blockchain App')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document, {
        customCss: `
    .topbar {display: none}
    `
    });
    await app.listen(process.env.PORT || 5002);
}
bootstrap();
//# sourceMappingURL=main.js.map