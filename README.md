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
# Примечания к файлу конфигурации

* Элементом массива является описание отдельной базы данных
* Свойства с префиксом db являются параметрами подключения к базе
* namespace отображает имя схемы в базе данных
* Массив tables показывает какие таблицы будут использоваться при работе со схемой
* У каждого элемента table существует опциональное поле historyPath, которое показывает есть ли у модели модель логирования.
* Желательно для создания моделей логирования использовать npm пакет grunt-generate-history-model[(https://github.com/AbatapCompany/grunt-generate-history-model)] и его декораторы,а не созданные вручную модели логирования
