export interface User {
    username: string;
    taggerId: string;
    tshirtId: string | null;
    life: number;
}

export enum Mode {
    init,
    setup_mode,
    game_mode
}

export class State {

    private static MAX_LIFE = 5;

    private _taggers: Set<string> = new Set();
    private _users: User[] = [];
    private _mode: Mode = Mode.init;


    public get taggers(): Set<string> {
        return this._taggers;
    }
    public set taggers(taggers: Set<string>) {
        this._taggers = taggers;
    }

    public get users(): User[] {
        return this._users;
    }
    public set users(users: User[]) {
        this._users = users;
    }

    public get mode(): Mode {
        return this._mode;
    }
    public set mode(mode: Mode) {
        this._mode = mode;
    }


    public startSetup(): void {
        if (this.mode !== Mode.init) {
            throw new Error('Wrong state');
        }
        this._mode = Mode.setup_mode;
    }
    public startGame(): void {
        if (this.mode !== Mode.setup_mode) {
            throw new Error('Wrong state');
        }
        this._mode = Mode.game_mode;
    }
    public gameFinished(): void {
        if (this.mode !== Mode.game_mode) {
            throw new Error('Wrong state');
        }

        this._mode = Mode.init;
        this.taggers.clear();
        this.users = [];
    }



    public addTagger(taggerId: string): void {
        this.taggers.add(taggerId);
    }
    public removeTagger(taggerId: string): void {
        this.taggers.delete(taggerId);
        this.users = this.users.filter((user: User) => user.taggerId !== taggerId);
    }


    public addUser(user: Pick<User, 'username' | 'taggerId'>): void {
        if (this.mode !== Mode.setup_mode) {
            throw new Error('Wrong state');
        }

        this.users.push({
            ...user,
            tshirtId: null,
            life: State.MAX_LIFE
        });
    }


    public bindTshirt(username: string, tshirtId: string): void {
        if (this.mode !== Mode.setup_mode) {
            throw new Error('Wrong state');
        }

        this.users = this.users.map((user: User) => {
            if (user.username === username) {
                user.tshirtId = tshirtId;
            }
            return user;
        });
    }

    public tag(tshirtId: string): User | null {
        if (this.mode !== Mode.game_mode) {
            throw new Error('Wrong state');
        }

        let taggedUser: User | null = null;

        this.users = this.users.map((user: User) => {
            if (user.tshirtId === tshirtId) {
                user.life--;
            }

            taggedUser = user;
            return user;
        });

        return taggedUser;
    }

    public getAliveUsersCount(): number {
        return this.users.reduce((acc: number, curr: User) => acc + (curr.life > 0 ? 1 : 0), 0);
    }

}