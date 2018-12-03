const RoleDb = require('./store/store');

module.exports = class RoleSub {
    constructor() {
        this._db = new RoleDb();
    }

    async addRole(message, roleArgs) {
        const result = {};
        result.invalidRoles = [];
        result.validRoles = roleArgs.map(arg => {
            const role = message.guild.roles.find(role => role.name === arg);
            if (role !== null) {
                return role;
            } else {
                result.invalidRoles.push(arg);
                return null;
            }
        }).filter(role => role !== null);

        if (result.validRoles.length) {
            let response;
            try {
                response = await this._db.addRoleAsync(message, result.validRoles)
            } catch(err) {
                console.error(err);
            }
            result.response = response;
            return result;
        } else {
            return `No valid roles`;
        }
    }

    async list(message) {
        let result;
        try {
            result = await this._db.getListAsync(message);
        } catch(err) {
            console.error(err);
        }
        return result;
    }
};