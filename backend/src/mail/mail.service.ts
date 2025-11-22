import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    // In production, use environment variables for SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'noreply@lexnotar.ro',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });
  }

  private async loadTemplate(templateName: string, context: any): Promise<string> {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    try {
      const html = await this.loadTemplate('welcome', { userName });
      
      await this.transporter.sendMail({
        from: '"LexNotar" <noreply@lexnotar.ro>',
        to,
        subject: 'Welcome to LexNotar - Your Account is Ready',
        html,
      });

      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      // Don't throw - email is not critical
    }
  }

  async sendTaskDeadlineAlert(to: string, task: any): Promise<void> {
    try {
      const html = await this.loadTemplate('task-deadline', {
        userName: to.split('@')[0],
        taskTitle: task.title,
        taskDueDate: new Date(task.dueDate).toLocaleDateString('ro-RO'),
        taskPriority: task.priority,
        taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}`,
      });
      
      await this.transporter.sendMail({
        from: '"LexNotar" <noreply@lexnotar.ro>',
        to,
        subject: `⚠️ Task Deadline Alert: ${task.title}`,
        html,
      });

      this.logger.log(`Task deadline alert sent to ${to} for task ${task.id}`);
    } catch (error) {
      this.logger.error(`Failed to send task deadline alert to ${to}:`, error);
    }
  }

  async sendCaseStatusUpdate(to: string, caseData: any): Promise<void> {
    try {
      const html = await this.loadTemplate('case-status', {
        userName: to.split('@')[0],
        caseTitle: caseData.title,
        caseStatus: caseData.status,
        caseUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cases/${caseData.id}`,
      });
      
      await this.transporter.sendMail({
        from: '"LexNotar" <noreply@lexnotar.ro>',
        to,
        subject: `Case Update: ${caseData.title}`,
        html,
      });

      this.logger.log(`Case status update sent to ${to} for case ${caseData.id}`);
    } catch (error) {
      this.logger.error(`Failed to send case status update to ${to}:`, error);
    }
  }

  async sendDocumentSignatureRequest(to: string, document: any): Promise<void> {
    try {
      const html = await this.loadTemplate('signature-request', {
        userName: to.split('@')[0],
        documentTitle: document.title,
        documentUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/documents/${document.id}`,
      });
      
      await this.transporter.sendMail({
        from: '"LexNotar" <noreply@lexnotar.ro>',
        to,
        subject: `📝 Signature Required: ${document.title}`,
        html,
      });

      this.logger.log(`Signature request sent to ${to} for document ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to send signature request to ${to}:`, error);
    }
  }

  async sendTaskAssignment(to: string, task: any, assignedBy: string): Promise<void> {
    try {
      const html = await this.loadTemplate('task-assignment', {
        userName: to.split('@')[0],
        taskTitle: task.title,
        assignedBy,
        taskDueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('ro-RO') : 'No deadline',
        taskPriority: task.priority,
        taskUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tasks/${task.id}`,
      });
      
      await this.transporter.sendMail({
        from: '"LexNotar" <noreply@lexnotar.ro>',
        to,
        subject: `New Task Assignment: ${task.title}`,
        html,
      });

      this.logger.log(`Task assignment email sent to ${to} for task ${task.id}`);
    } catch (error) {
      this.logger.error(`Failed to send task assignment email to ${to}:`, error);
    }
  }
}
