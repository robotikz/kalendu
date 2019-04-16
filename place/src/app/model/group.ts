import { Place } from './place';

export class Group {
    id: string;
    title = '';
    min: number;
    max: number;
    deadline: number;
    place_id: string;
    place: Place;
    camisole = false;
    ball = false;

    status = 1;

    owner: string; // email of owner
    member: [] = [];  // email of members
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
