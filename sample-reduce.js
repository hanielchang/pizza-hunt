// Just some sample code of how reduce can be used, taken from Module 18.
const developers = [
    {
        name: "Eliza",
        experience: 7,
        role: "manager"
    },
    {
        name: "Manuel",
        experience: 2,
        role: "developer"
    },
    {
        name: "Kim",
        experience: 5,
        role: "developer"
    }
];

function calculateAverage(total, years, index, array) {
    total += years;
    return index === array.length - 1 ? total / array.length : total
}

const average = developers.map(dev => dev.experience).reduce(calculateAverage);