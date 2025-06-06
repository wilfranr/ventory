import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MessageService } from 'primeng/api';
import { appConfig } from './app.config';

bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [...(appConfig.providers || []), MessageService]
}).catch((err) => console.error(err));
