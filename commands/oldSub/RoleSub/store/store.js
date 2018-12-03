module.exports = class Store {
    constructor() {
        this._store = [];
    }

    async addRoleAsync(message, roles) {
        const guildId = message.guild.id;
        const response = {
            added: [],
            existing: []
        };
        try {
            roles.map(role => {
                if (this._store.find(element => element.guildId === guildId && element.roleId === role.id)) {
                    return response.existing.push(role.name);
                } else {
                    this._store.push({
                        guildId: guildId,
                        roleId: role.id,
                        role: role
                    });
                    return response.added.push(role.name);
                }
            });
        } catch(err) {
            console.error(err);
        }
        return response;
    }
    async deleteRoleAsync(message, roles) {
        const guildId = message.guild.id;
        const response = {
            deleted: [],
            nonexistent: []
        };
        try {
            roles.map(role => {
                if (this._store.find(element => element.guildId === guildId && element.roleId === role.id)) {
                    this._store = this._store.filter(element => element.roleId !== role.id);
                    return response.deleted.push(role.name);
                } else {
                    return response.nonexistent.push(role.name);
                }
            });
        } catch(err) {
            console.error(err);
        }
        return response;
    }

    async getListAsync(message) {
        let response;
        try {
            const guildId = message.guild.id;
            response = this._store.filter(element => {
                return element.guildId === guildId;
            });
        } catch(err) {
            console.error(err);
        }
        return response;
    }
};