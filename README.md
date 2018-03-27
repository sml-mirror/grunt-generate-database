# grunt-generate-database

[![Build Status](https://travis-ci.org/AbatapCompany/grunt-generate-history-model.svg?branch=master)](https://travis-ci.org/AbatapCompany/grunt-generate-database)

Репозиторий ,который хранит в себе плагин для создания DBWrapper,триггера и функции управления триггером с помощью typeorm и postgres
# Установка

  npm install grunt-generate-database
  
# Как начать использовать
* Создайте declaration.json в корневом катологе
```json
[
    {
      "name" : "base1",
      "dbtype" : "dbtype1",
      "dbhost" : "dbhost1",
      "dbport" : "dbport1",
      "dbusername" : "dbusername1",
      "dbpassword" : "dbpassword1",
      "dbdatabase" : "dbdatabase1",
      "pathToDBWrappers": "./dbscript",
      "schemas" : 
     [
       {
         "namespace": "testnamespace",
         "recreate":true,
         "tables":
         [
           {
             "name": "Class", 
             "pathToModel": "./models/class"
           }
         ]
       }
     ]
   }
 ]
``` 
```typescripts
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import { GenerateHistory } from "grunt-generate-history-model";

@Entity()
@GenerateHistory({"historyPath": "./test/src/model/hero"})
export class Hero {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column()
    public name: string;
    public data: string;
    @Column()
    public detailId?: number;
    @Column({"type": "integer", "array": true, "nullable": true})
    public simpleArray: number[];
}
```
* В package.json добавьте инициализирующую команду в свойство "script":
```json
  "scripts": {
    "generation": "generateDatabase"
  }
  ```
  где "generateDatabase" - строка для запуска плагина
  
* npm run generation

* после завершения работы плагина по пути,указанному в declaration.json в свойстве "pathToDBWrappers" ,появятся файлы с расширением ".ts" :
    * DBWrapper
 ```typescripts
 import { Class } from '../../../models/class';
import { createbase1TriggerFuncstestnamespace } from './function';
import { createbase1Triggerstestnamespace } from './trigger';
import * as dotenv from 'dotenv';
import {createConnection, Connection, getManager, EntityManager} from 'typeorm';

export class testnamespaceDBWrapper {

    private static connection: Connection;

    public static async initialize(dropSchema?: boolean, sync?: boolean): Promise<void> {
        await this.close();

        if (! dropSchema) {
            dropSchema = false;
        }
        if (! sync) {
            sync = false;
        }

        this.connection = await this.createTables(dropSchema, sync);
        if (dropSchema) {
            await createbase1TriggerFuncstestnamespace();
            await createbase1Triggerstestnamespace();
        }
    }

    private static async createTables(dropSchema?: boolean, sync?: boolean) {
        return await createConnection({
            name: 'testnamespace',
            type: 'postgres',
            replication: {
                master: {
                    host:  process.env.dbhost1,
                    port: parseInt(process.env.dbport1, 10),
                    username:  process.env.dbusername1,
                    password: process.env.dbpassword1,
                    database: process.env.dbdatabase1
                },
                slaves: []
            },
            entities: [
            Class
],
      schema: 'testnamespace',
      synchronize: sync,
      dropSchema: dropSchema
      });
    }
    public static getEntityManager (): EntityManager {
        return getManager('testnamespace');
    }

    public static async close(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
 ```
    * Триггерная функция(пустая в примере в связи с отсутствием модели логирования)
```typescript
import {createConnection, ConnectionOptions} from 'typeorm';


export async function createbase1TriggerFuncstestnamespace() {
const pgp = require('pg-promise')({});
await pgp.end();
const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;

const db = pgp(connectionString);
let queryproc = '';
pgp.end();

}
```
    * Триггер
``` typescript
import {createConnection, ConnectionOptions} from 'typeorm';


export async function createbase1Triggerstestnamespace() {
    const pgp = require('pg-promise')({});
    await pgp.end();
    const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
    process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;
    const db = pgp(connectionString);
    let queryproc;
    let lowerStringName;
    let lowewrStringSchema;
    pgp.end();
}
```
# Примечания к файлу конфигурации

* Элементом массива является описание отдельной базы данных.
* Свойства с префиксом db являются параметрами подключения к базе.
* namespace отображает имя схемы в базе данных.
* Массив tables показывает какие таблицы будут использоваться при работе со схемой.
* У каждого элемента table существует опциональное поле historyPath, которое показывает есть ли у модели модель логирования.
* Желательно для создания моделей логирования использовать npm пакет [grunt-generate-history-model](https://github.com/AbatapCompany/grunt-generate-history-model) и его декораторы,а не созданные вручную модели логирования.
* При использовании npm пакета для создания моделей логирования не обязательно указывать путь к моделям логирования в конфигурации.
