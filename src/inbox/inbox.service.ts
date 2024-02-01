import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { Mail } from './entities/mail.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InboxService {
  private readonly logger = new Logger('IMAP');
  private imapInstances: Map<string, any> = new Map();

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Mail)
    private readonly mailRepository: Repository<Mail>,
  ) {}

  private onError(err) {
    this.logger.error('IMAP Connection error', err);
  }

  private onEnd() {
    this.logger.log('IMAP Connection ended');
  }

  public connectImap(email: string, password: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: email,
        password: password,
        host: this.config.get('IMAP_HOST'),
        port: this.config.get('IMAP_PORT'),
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      });

      this.imapInstances.set(email, imap);

      imap.once('ready', () => {
        this.onReady(email, resolve, reject);
      });
      imap.once('error', (err) => {
        this.onError(err);
        reject(err);
      });
      imap.once('end', () => this.onEnd());

      imap.connect();
    });
  }

  private onReady(email: string, resolve: any, reject: any) {
    this.logger.log(`IMAP Connection ready for ${email}`);

    const imap = this.imapInstances.get(email);
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        reject(err);
        return;
      }
      this.fetchEmails(imap, resolve, reject);
    });
  }

  private fetchEmails(imap: Imap, resolve: any, reject: any) {
    imap.search(['ALL'], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      const emailPromises = [];
      const f = imap.fetch(results, { bodies: '' });

      f.on('message', (msg, seqno) => {
        let mailContent = '';
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            mailContent += chunk.toString('utf8');
          });
        });

        msg.once('end', () => {
          const emailPromise = new Promise((resolve, reject) => {
            simpleParser(mailContent, (err, mail) => {
              if (err) {
                reject(err);
                return;
              }
              resolve({
                id: seqno,
                from: mail.from.text,
                subject: mail.subject,
                text: mail.text,
                date: mail.date,
              });
            });
          });
          emailPromises.push(emailPromise);
        });
      });

      f.once('error', (err) => {
        this.logger.error('Fetch error', err);
        reject(err);
      });

      f.once('end', () => {
        this.logger.log('Done fetching all messages');
        imap.end();
        Promise.all(emailPromises)
          .then((emails) => {
            resolve(emails);
          })
          .catch(reject);
      });
    });
  }

  public async pagenate(page = 1) {
    const take = 6;
    const [boards, total] = await this.mailRepository.findAndCount({
      take,
      skip: (page - 1) * take,
    });
    return {
      boards,
      totalPage: Math.ceil(total / take),
      page,
    };
  }
}
