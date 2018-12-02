module.exports = class Store {
    constructor() {
        this._store = [];
    }

    async addRoleAsync(message, roles) {
        console.log(this._store);
        const guildId = message.guild.id;
        return roles.map(role => {
            const roleId = role.id;
            if (this._store.find(element => element.guildId === guildId && element.roleId === role.id)) {
                return `${role.name} already added`;
            } else {
                this._store.push({ guildId, roleId, role });
                return `${role.name} added`;
            }
        });
    }

    async getListAsync(message) {
        const guildId = message.guild.id;
        const response = this._store.filter(element => {
            console.log(element, element.guildId, guildId);
            return element.guildId === guildId;
        });
        console.log(response);
        return response;
    }
};