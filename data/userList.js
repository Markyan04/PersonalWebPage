class UserList {
    static #instance = null;

    constructor() {
        if (UserList.#instance) {
            throw new Error("Use UserList.getInstance() instead");
        }
        this.connectedUsers = new Map();
        this.onCompetitionUsers = new Map();
        UserList.#instance = this;
    }

    static getInstance() {
        if (!UserList.#instance) {
            UserList.#instance = new UserList();
        }
        return UserList.#instance;
    }

    addUser(socketId, username) {
        this.connectedUsers.set(socketId, username);
        console.log(`User has connected: ${username} (Total: ${this.connectedUsers.size})`);
    }

    removeUser(socketId) {
        if (this.connectedUsers.has(socketId)) {
            const username = this.connectedUsers.get(socketId);
            this.connectedUsers.delete(socketId);
            console.log(`User has disconnected: ${username} (Remainder: ${this.connectedUsers.size})`);
        }
    }

    addOnCompetitionUser(socketId, username) {
        this.onCompetitionUsers.set(socketId, username);
        console.log(`User has entered the competition: ${username} (Total: ${this.onCompetitionUsers.size})`);
    }

    removeOnCompetitionUser(socketId) {
        if (this.onCompetitionUsers.has(socketId)) {
            const username = this.onCompetitionUsers.get(socketId);
            this.onCompetitionUsers.delete(socketId);
            console.log(`User has left the competition: ${username} (Remainder: ${this.onCompetitionUsers.size})`);
        }
    }

    getConnectedUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.connectedUsers.values());
    }

    getOnCompetitionUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.onCompetitionUsers.values());
    }

    getConnectedUserSocketIdsWithName() {
        /**
         * @returns {{ socketId: string, username: string }[]}
         * */
        return Array.from(this.connectedUsers, ([socketId, username]) => ({ socketId, username }));
    }

    getOnCompetitionUserSocketIdsWithName() {
        /**
         * @returns {{ socketId: string, username: string }[]}
         * */
        return Array.from(this.onCompetitionUsers, ([socketId, username]) => ({ socketId, username }));
    }

    getOnlineUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.connectedUsers.values())
                .filter(username => !this.onCompetitionUsers.has(username));
    }
}

export default UserList;
