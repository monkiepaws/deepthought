const RoleDb = require('./store/store');

module.exports = class RoleSub {
    constructor() {
        this._db = new RoleDb();
    }

    async addRole(message, roleArgs) {
        const validRoles = await roleArgs.map(arg => message.guild.roles.find(role => role.name === arg))
            .filter(role => role !== null);
        console.log(validRoles);
        if (validRoles.length) {
            let result;
            try {
                result = await this._db.addRoleAsync(message, validRoles)
            } catch(err) {
                console.error(err);
            }
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