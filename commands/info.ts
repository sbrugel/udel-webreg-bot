import { ICommand } from "wokcommands";
import cheerio from 'cheerio'
import axios from 'axios'
import { MessageEmbed } from "discord.js";

export default {
    category: 'Test',
    description: 'Get information for a course',
    slash: true,
    testOnly: true,
    options: [
        {
            name: 'course',
            description: `The course to look up, must be in this format: CISC108`,
            type: 'STRING',
            required: true,
        }
    ],
    callback: async ({ interaction }) => {
        const url = `https://udapps.nss.udel.edu/CourseDescription/info?searchKey=2021%7c${interaction.options.getString('course')}`;
        const scraper = axios.create();

        let title = '', credits = '', description = '', department = '', prereq = '', miscinfo = '';
        let cont = true;

        await scraper.get(url)
        .then(
            response => {
                const html = response.data;
                const $ = cheerio.load(html);

                let textElems = $('.itwd-template-body > .container > h2');

                textElems.each((index, elem) => { // non existent course check
                    if ($(elem).text().includes('2021|')) { // default course title (h2 element) is "<year number>|user input"
                        interaction.reply({ content: `${interaction.options.getString('course')!.toUpperCase()} is not a valid course!`, ephemeral: true });
                        cont = false;
                    } else {
                        title = $(elem).text();
                    }
                })

                textElems = $('.itwd-template-body > .container > p');
                textElems.each((index, elem) => {
                    /*
                    starting at index 0:
                    - index 1: credit hours
                    - index 2: description
                    - prerequsities and other info are determined using string indexing 
                    */
                   switch (index) {
                        case 1:
                            credits = $(elem).text();
                            break;
                        case 2:
                            description = $(elem).text().trim();
                            break;
                        case 3:
                            department = $(elem).text();
                            break;
                        case 4:
                            department += `\n${$(elem).text()}` ;
                            break;
                        default:
                            if ($(elem).text().includes('Prerequisites:')) {
                                prereq = $(elem).text().trim().substring(14);
                            } else if ($(elem).text().includes('About this section:')) {
                                miscinfo = $(elem).text().substring(24);
                            }
                            break;
                    }
                })
            }
        )
        .catch(console.error);

        if (!cont) return;

        const responseEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(title)
            .setDescription(description!)
            .addFields(
                { name: 'Credits', value: credits!, inline: true },
                { name: 'College & Department', value: department!, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: 'Prerequsities', value: prereq! || `${interaction.options.getString('course')!.toUpperCase()} does not have any listed course prerequisites.`, inline: true },
                { name: 'Other Information', value: miscinfo! || 'No other information', inline: true },
            )
        
        return interaction.reply({ embeds: [responseEmbed] });
    }
} as ICommand