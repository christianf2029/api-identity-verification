export enum UserPersonType {
  Natural = 'natural',
  Legal = 'legal'
}

export type UserIdentification = {
  status: 'awaiting' | 'validated',
  at?: string,
  chargeId?: string,
  endToEndId?: string,
  returnId?: string
}

export type UserRegistration = {
  by: 'integrator' | 'payment_transaction',
  at: string
}

export type UserJSON = {
  id: string,
  name: string,
  document: string,
  identification: UserIdentification,
  registration: UserRegistration
}

export class User {
  private _id: string;
  private _name: string;
  private _document: string;
  private _personType: UserPersonType;
  private _identification: UserIdentification;
  private _registration: UserRegistration;

  constructor(
    id: string,
    name: string,
    document: string,
    identification: UserIdentification,
    registration: UserRegistration
  ) {
    this._id = undefined as any;
    this._name = undefined as any;
    this._document = undefined as any;
    this._personType = undefined as any;
    this._identification = undefined as any;
    this._registration = undefined as any;

    this.id = id;
    this.name = name;
    this.document = document;
    this.identification = identification;
    this.registration = registration;
  }

  get id() {
    return this._id;
  }

  set id(id: string) {
    if (!id || id.length === 0) {
      throw new Error('Invalid user id');
    }

    this._id = id;
  }

  get name() {
    return this._name;
  }

  set name(name: string) {
    if (!name || name.length === 0) {
      throw new Error('Invalid user name');
    }

    this._name = name;
  }

  get document() {
    return this._document;
  }

  set document(document: string) {
    if ([11, 14].every((length) => length !== document.length)) {
      throw new Error('Invalid user document');
    }

    this._document = document;
    this._personType = document.length === 11 ? UserPersonType.Natural : UserPersonType.Legal;
  }

  get personType() {
    return this._personType;
  }

  get identification() {
    return this._identification;
  }

  set identification(identification: UserIdentification) {
    if (!identification || !identification.status) {
      throw new Error('Invalid user identification');
    }

    this._identification = identification;
  }

  get registration() {
    return this._registration;
  }

  set registration(registration: UserRegistration) {
    if (!registration) {
      throw new Error('Invalid user registration');
    }

    this._registration = registration;
  }

  public toJSON(): UserJSON {
    return {
      id: this.id,
      name: this.name,
      document: this.document,
      identification: this.identification,
      registration: this.registration
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
