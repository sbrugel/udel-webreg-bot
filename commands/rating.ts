import ratings from '@mtucourses/rate-my-professors';
import { ColorResolvable, MessageEmbed } from 'discord.js';
import { ICommand } from 'wokcommands';

export default {
    category: 'Test',
    description: 'Get rating information for a professor',
    slash: true,
    testOnly: true,
    options: [
        {
            name: 'professor',
            description: `The professor to search for`,
            type: 'STRING',
            required: true,
        }
    ],
    callback: async ({ interaction }) => {
        const prof = interaction.options.getString('professor')!;
        const profs = await ratings.searchTeacher(prof, 'U2Nob29sLTEwOTQ=');
        if (!profs[0]) return interaction.reply({ content: 'No results for ' + prof, ephemeral: true });
        const teacher = await ratings.getTeacher(profs[0].id);

        let color = 'BLURPLE';
        if (teacher.avgRating <= 1.5) {
            color = 'RED';
        } else if (teacher.avgRating <= 2.5) {
            color = 'ORANGE';
        } else if (teacher.avgRating <= 3.5) {
            color = 'YELLOW';
        } else if (teacher.avgRating <= 4.5) {
            color = 'GREEN';
        } else if (teacher.avgRating <= 5) {
            color = 'BLUE';
        }


        const responseEmbed = new MessageEmbed()
            .setTitle(`RMP Data for ${profs[0].firstName} ${profs[0].lastName}`)
            .addFields(
                { name: 'Subject', value: teacher.department.toString(), inline: true },
                { name: 'Average Rating', value: teacher.avgRating.toString(), inline: true },
                { name: 'Average Difficulty', value: teacher.avgDifficulty.toString(), inline: true },
            )
            .setColor(color as ColorResolvable)
            .setFooter({ text: `This data is based on ${teacher.numRatings} ratings` })

        return interaction.reply({ embeds: [responseEmbed] });
    }
} as ICommand