import { Sport } from './sport';

export class Place {
  id: string;
  title = '';
  info = '';
  city = '';
  zip = '';
  state = '';
  street = '';
  nr = '';
  status = 1;
  sports: Sport[] = [];

  // access ids
  aowner: string;
  amember: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }

  toJSON() {
    return Object.assign({}, this);
  }
}


