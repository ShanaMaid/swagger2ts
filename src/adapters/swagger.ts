// tslint:disable no-any
const swagMock = require('swagMock');
import json2ts from '../utils/json2ts';
import { IInterface } from '../utils/out';
import outFile from '../utils/out';

export interface IOpt {
  blackList?: string[];
  optional?: boolean;
  suffix?: string;
}

const parse = async (swagger: any, opt?: IOpt) => {
  const interfaces: IInterface[] = [];
  const { suffix = 'ts' } = (opt || {});
  const mockgen = swagMock(swagger);
  const urls = Object.keys(swagger.paths);

  for (const url of urls) {
    const methods = Object.keys(swagger.paths[url]);
    for (const method of methods) {
      const pathName = `${method.toUpperCase()}${url}`.replace(/\{(.*?)\}/g, ':$1');

      const temp: IInterface = {
        fileName: `${pathName}.${suffix}`,
        method,
        path: url.replace(/\{(.*?)\}/g, ':$1'),
        content: '',
      };

      // mock数据
      await new Promise((r) => {
        mockgen.responses({
          path: url,
          operation: method.toLowerCase(),
          response: 200,
        })
        // tslint:disable-next-line no-any
        .then((mock: any) => {
          const res = mock.responses;
          // if (typeof res === 'object' && res !== null) {
          temp.content = json2ts(res);
          // } else {
            // temp.content = `export type RootObject = ${typeof res}`;
          // }
          interfaces.push(temp);
          r();
        });
      });
    }
  }
  return interfaces;
};

export default async (
  swagger: any,
  dir: string,
  opt?: IOpt,
) => {
  const result = await parse(swagger, opt);
  outFile(result, dir, opt);
};
