const BeaconDb = require('./db/BeaconDb.js');

module.exports = class Beacon {
    constructor() {
        this._db = new BeaconDb();
    }

    async showList() {
        let result;
        try {
            result = await this._db.request.getAvailableBeacons();
        } catch(err) {
            console.log(err);
        }
        return this.messageList(result);
        // return this.embeddedList(result);
    }

    messageList(result) {
        if (result.rowsAffected === 0) {
            return `No one is waiting, yet!\n
                    Don't forget to add yourself to the waiting list. Check out !games help`;
        }

        let list = `**WP Looking For Games**\n__All Available Beacons__\n\n`;
        const date = new Date();
        result.recordset.map((beacon, index) => {
            const { Username, GameName, PlatformName, EndTime } = beacon;
            const platform = PlatformName === 'pc' ? `` : `\t(${PlatformName.toUpperCase()})`;
            const available = (EndTime - date.getTime()) / 60000;
            const time = available < 60 ? available : available / 60;
            const handle = available < 60 ? `minutes` : `hours`;
            list += `**${Username}**\tfor ${Math.floor(time)} ${handle}\t***${GameName.toUpperCase()}***${platform}\n`
        });
        return list;
    }

    embeddedList(result) {
        const fields = [];

        if (result.rowsAffected === 0) {
            fields.push({
               name: `No one is waiting, yet!`,
               value: `Don't forget to add yourself to the waiting list. Check out !games help`
            });
        } else {
            // const fieldName = {
            //     name: `Name`,
            //     value: ``,
            //     inline: true
            // };
            // const fieldGame = {
            //     name:  `Game`,
            //     value: ``,
            //     inline: true
            // };
            // const fieldTime = {
            //     name: `Available`,
            //     value: ``,
            //     inline: true
            // };
            //
            // const date = new Date();
            // result.recordset.map((beacon, index) => {
            //     const { Username, GameName, PlatformName, EndTime } = beacon;
            //     const platform = PlatformName === 'pc' ? `` : `on ${PlatformName.toUpperCase()}`;
            //     const available = (EndTime - date.getTime()) / 60000;
            //     const time = available < 60 ? available : available / 60;
            //     const handle = available < 60 ? `minutes` : `hours`;
            //     fieldName.value += `${index + 1}. **${Username}**\n`;
            //     fieldGame.value += `${GameName.toUpperCase()} ${platform}\n`;
            //     fieldTime.value += `${Math.floor(time)} ${handle}\n`;
            // });
            //
            // const items = [fieldName, fieldGame, fieldTime];
            // fields.push(...items);

            const date = new Date();
            result.recordset.map((beacon, index) => {
                const { Username, GameName, PlatformName, EndTime } = beacon;
                const platform = PlatformName === 'pc' ? `` : ` on ${PlatformName.toUpperCase()}`;
                const available = (EndTime - date.getTime()) / 60000;
                const time = available < 60 ? available : available / 60;
                const handle = available < 60 ? `minutes` : `hours`;
                const field = {
                    name: `${index + 1}. **${Username}**\t*${GameName.toUpperCase()}*${platform}`,
                    value: `for ${Math.floor(time)} ${handle}`,
                    inline: true
                };
                fields.push(field);
            });
        }

        const embed = {
            color: 0xff4992,
            title: `All available beacons`,
            author: {
                name: `WP Looking For Games`
            },
            description: ``,
            fields: fields
        };
        console.log(embed);
        return embed;
    }
};