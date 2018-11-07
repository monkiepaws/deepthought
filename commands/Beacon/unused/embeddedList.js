// embeddedList(result) {
//     const fields = [];
//
//     if (result.rowsAffected === 0) {
//         fields.push({
//             name: `No one is waiting, yet!`,
//             value: `Don't forget to add yourself to the waiting list. Check out !games help`
//         });
//     } else {
//         // const fieldName = {
//         //     name: `Name`,
//         //     value: ``,
//         //     inline: true
//         // };
//         // const fieldGame = {
//         //     name:  `Game`,
//         //     value: ``,
//         //     inline: true
//         // };
//         // const fieldTime = {
//         //     name: `Available`,
//         //     value: ``,
//         //     inline: true
//         // };
//         //
//         // const date = new Date();
//         // result.recordset.map((beacon, index) => {
//         //     const { Username, GameName, PlatformName, EndTime } = beacon;
//         //     const platform = PlatformName === 'pc' ? `` : `on ${PlatformName.toUpperCase()}`;
//         //     const available = (EndTime - date.getTime()) / 60000;
//         //     const time = available < 60 ? available : available / 60;
//         //     const handle = available < 60 ? `minutes` : `hours`;
//         //     fieldName.value += `${index + 1}. **${Username}**\n`;
//         //     fieldGame.value += `${GameName.toUpperCase()} ${platform}\n`;
//         //     fieldTime.value += `${Math.floor(time)} ${handle}\n`;
//         // });
//         //
//         // const items = [fieldName, fieldGame, fieldTime];
//         // fields.push(...items);
//
//         const date = new Date();
//         result.recordset.map((beacon, index) => {
//             const { Username, GameName, PlatformName, EndTime } = beacon;
//             const platform = PlatformName === 'pc' ? `` : ` on ${PlatformName.toUpperCase()}`;
//             const available = (EndTime - date.getTime()) / 60000;
//             const time = available < 60 ? available : available / 60;
//             const handle = available < 60 ? `minutes` : `hours`;
//             const field = {
//                 name: `${index + 1}. **${Username}**\t*${GameName.toUpperCase()}*${platform}`,
//                 value: `for ${Math.floor(time)} ${handle}`,
//                 inline: true
//             };
//             fields.push(field);
//         });
//     }
//
//     const embed = {
//         color: 0xff4992,
//         title: `All available beacons`,
//         author: {
//             name: `WP Looking For Games`
//         },
//         description: ``,
//         fields: fields
//     };
//     console.log(embed);
//     return embed;
// }