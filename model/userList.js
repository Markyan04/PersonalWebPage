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
        this.connectedUsers.set(username, socketId);
        console.log(`User has connected: ${username} (Total: ${this.connectedUsers.size})`);
    }

    removeUser(socketId, username) {
        if (this.connectedUsers.has(username)) {
            this.connectedUsers.delete(username);
            console.log(`User has disconnected: ${username} (Remainder: ${this.connectedUsers.size})`);
        }
    }

    addOnCompetitionUser(socketId, username) {
        this.onCompetitionUsers.set(username, socketId);
        console.log(`User has entered the competition: ${username} (Total: ${this.onCompetitionUsers.size})`);
    }

    removeOnCompetitionUser(socketId, username) {
        if (this.onCompetitionUsers.has(username)) {
            this.onCompetitionUsers.delete(username);
            console.log(`User has left the competition: ${username} (Remainder: ${this.onCompetitionUsers.size})`);
        }
    }

    getConnectedUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.connectedUsers.keys());
    }

    getOnCompetitionUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.onCompetitionUsers.keys());
    }

    getConnectedUserSocketIdsWithName() {
        /**
         * @returns {{ username: string, socketId: string }[]}
         * */
        return Array.from(this.connectedUsers, ([username, socketId]) => ({ username, socketId }));
    }

    getOnCompetitionUserSocketIdsWithName() {
        /**
         * @returns {{ username: string, socketId: string }[]}
         * */
        return Array.from(this.onCompetitionUsers, ([username, socketId]) => ({ username, socketId }));
    }

    getOnlineUsers() {
        /**
         * @returns {string[]}
         */
        return Array.from(this.connectedUsers.keys()).filter(username => !this.onCompetitionUsers.has(username));
    }

    getSocketIdByUsername(username) {
        /**
         * @returns {string | undefined}
         */
        for (const [key, value] of this.connectedUsers) {
            if (key === username) {
                return value;
            }
        }
    }
}

export default UserList;