import { PrismaClient } from '@prisma/client';

const data = [
	{
		year: '2021',
		publications: [
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'Krishnaraj', 'Ramamurthy', 'santosh', 'Avinash'],
				title: 'An Automated Robotic Arm: A Machine Learning Approach',
				month_year: '2022',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE Conference',
				journal: 'IEEE Xplore',
				conference: 'International Conference on Mobile Networks and Wireless Communications',
				link: 'https://ieeexplore.ieee.org/document/9688512'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['D. N. Disha', 'S Seema', 'K. Aditya Shastry'],
				title:
					'Prediction of Autism in Children with Down’s Syndrome Using Machine Learning Algorithms',
				month_year: 'November 2021',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'SPRINGER',
				journal: '',
				conference: 'Recent Advances in Artificial Intelligence and Data Engineering',
				link: 'https://link.springer.com/chapter/10.1007/978-981-16-3342-3_9'
			}
		]
	},
	{
		year: '2022',
		publications: [
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['DN Disha', 'S Seema', 'Sharada U Shenoy', 'Sudesh Rao'],
				title: 'Prediction of Bipolar Disorder Using Machine Learning Techniques',
				month_year: '1st June 2022',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'International Conference on Intelligent Technologies (CONIT)',
				link: 'https://ieeexplore.ieee.org/abstract/document/9848137/'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: [
					'Rao',
					'S. Santhosh',
					'S',
					'Preethi Salian',
					'K',
					'Prathyakshini',
					'Sandeep Kumar',
					'S'
				],
				title:
					'A Novel Approach to Generate the Captions for Images with Deep Learning using CNN and LSTM Model',
				month_year: '12th December 2022',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Distributed Computing, VLSI, Electrical Circuits and Robotics (DISCOVER)',
				link: 'https://ieeexplore.ieee.org/document/9974750'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: [
					'Salian',
					'S.',
					'Preethi Salian',
					'K.',
					'Puneeth',
					'B.P. Nargis',
					'T',
					'Sudesh Rao'
				],
				title: 'Detection of Valvular Heart and Respiratory Diseases using and AI technique',
				month_year: '18th April 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'Third International Conference on Smart Technologies in Computing, Electrical and Electronics (ICSTCEE)',
				link: 'https://ieeexplore.ieee.org/document/10099807'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['DN Disha', 'S Seema', 'Sharada U Shenoy', 'Sudesh Rao'],
				title: 'Prediction of Bipolar Disorder Using Machine Learning Techniques',
				month_year: '1st June 2022',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'International Conference on Intelligent Technologies (CONIT)',
				link: 'https://ieeexplore.ieee.org/abstract/document/9848137/'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['Balaji N', 'Karthik Pai B H', 'Devidas', 'K Adithya Shastry', 'DN Disha'],
				title: 'Pushing the Boundaries of Combinatorial Graph Isomorphism Algorithms',
				month_year: 'March 2022',
				ranking: 'Q2',
				impact_factor: '1.49',
				publisher: 'IAENG',
				indexed: 'Scopus',
				publisher_conference: '',
				journal: 'International Journal of Computer Science',
				conference: '',
				link: 'https://www.iaeng.org/IJCS/issues_v49/issue_1/IJCS_49_1_22.pdf'
			}
		]
	},
	{
		year: '2023',
		publications: [
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'T Chiddananda', 'DN Disha'],
				title:
					'Different Approaches To classify and predict the Diabetes of our current and future generation',
				month_year: '2023',
				ranking: 'Q4',
				impact_factor: '0.24',
				publisher: 'Latin America',
				indexed: 'Scopus',
				publisher_conference: '',
				journal: 'Latin American Journal of Pharmacy',
				conference: '',
				link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=MojgT6wAAAAJ&citation_for_view=MojgT6wAAAAJ:YsMSGLbcyi4C'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'Sanjeev D Kulkarni', 'T Chidananda', 'DN Disha'],
				title:
					'A Novel Approach For Prediction Of Diabetes Using Genetic Algorithm And Entropy Technique',
				month_year: '24th Novemver 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421681'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['Rakshitha', 'Pushpa Mohan', 'MB Shanthi', 'DN Disha', 'Sudesh Rao'],
				title:
					'Advances in Natural Language Processing and Deep Learning for Document Summarization',
				month_year: '24th November 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421343'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: [
					'Ajmeera Kiran',
					'Sudesh Rao',
					'Pravin B. Waghmare',
					'J. Somasekar',
					'Dharmesh Dhabliya',
					'Ankur Gupta'
				],
				title:
					'TyCo: A Novel Approach to Collaborative Filtering Recommendation Based on User Typicality',
				month_year: '15th February 2024',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'3rd International Conference on Advancement in Electronics & Communication Engineering (AECE)',
				link: 'https://ieeexplore.ieee.org/document/10428442'
			},
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: ['DN Disha', 'S Seema', 'CS Soumya', 'Sudesh Rao', 'Rakshitha'],
				title:
					'Predictive Modelling of Bipolar Disorder Utilizing Advanced Machine Learning Techniques',
				month_year: '24th November 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'International Conference on Futuristic Technologies (INCOFT)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10425438'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'T Chiddananda', 'DN Disha', 'Rakshitha'],
				title:
					'Different Approaches To classify and predict the Diabetes of our current and future generation',
				month_year: '2023',
				ranking: 'Q4',
				impact_factor: '0.24',
				publisher: 'Latin America',
				indexed: 'Scopus',
				publisher_conference: '',
				journal: 'Latin American Journal of Pharmacy',
				conference: '',
				link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=MojgT6wAAAAJ&citation_for_view=MojgT6wAAAAJ:YsMSGLbcyi4C'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'Sanjeev D Kulkarni', 'T Chidananda', 'DN Disha', 'Rakshitha'],
				title:
					'A Novel Approach For Prediction Of Diabetes Using Genetic Algorithm And Entropy Technique',
				month_year: '24th November 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421681'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['Rakshitha', 'Pushpa Mohan', 'MB Shanthi', 'DN Disha', 'Sudesh Rao'],
				title:
					'Advances in Natural Language Processing and Deep Learning for Document Summarization',
				month_year: '24th November 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421343'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['DN Disha', 'S Seema', 'CS Soumya', 'Sudesh Rao', 'Rakshitha'],
				title:
					'Predictive Modelling of Bipolar Disorder Utilizing Advanced Machine Learning Techniques',
				month_year: '24th November 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'International Conference on Futuristic Technologies (INCOFT)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10425438'
			},
			{
				name: 'Ms. Disha D N',
				designation: 'Assistant Professor',
				authors: ['Soumya CS', 'Manjula L', 'Pallavi', 'Disha D N'],
				title: 'Enhanced Supervision of Indoor Surveillance Video Using Deep Learning',
				month_year: '1st August 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: 'European Chemical Bulletin',
				indexed: 'Scopus',
				publisher_conference: '',
				journal: '',
				conference: '',
				link: '10.48047/ecb/2023.12.10.9072023.24/08/2023'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: ['Sowmya P', 'Sathish Kumar Ravichandran', 'Rakshitha'],
				title:
					'Systematic Literature Review on Industry Revolution 4.0 to Predict Maintenance and Life Time of Machines in Manufacturing Industry',
				month_year: '3rd February 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'IEEE 3rd International Conference on Artificial Intelligence and Smart Energy (ICAIS)',
				link: 'https://ieeexplore.ieee.org/document/10073753'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: [
					'Aishwarya D Shetty',
					'Jyothi Shetty',
					'Karthik K',
					'Rakshitha',
					'Shabari Shedthi B'
				],
				title: 'Real time translation of Sign Language for Speech Impaired',
				month_year: '23rd-25th February 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'IEEE 7th International Conference on Computing Methodologies and (ICCMC 2023)',
				link: 'https://ieeexplore.ieee.org/document/10084053'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'Sanjeev D Kulkarni', 'T Chidananda', 'DN Disha', 'Rakshitha'],
				title:
					'A Novel Approach For Prediction Of Diabetes Using Genetic Algorithm And Entropy Technique',
				month_year: '24th November 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421681'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: ['DN Disha', 'S Seema', 'CS Soumya', 'Sudesh Rao', 'Rakshitha'],
				title:
					'Predictive Modelling of Bipolar Disorder Utilizing Advanced Machine Learning Techniques',
				month_year: '24th November 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference: 'International Conference on Futuristic Technologies (INCOFT)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10425438'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: ['Rakshitha', 'Pushpa Mohan', 'MB Shanthi', 'DN Disha', 'Sudesh Rao'],
				title:
					'Advances in Natural Language Processing and Deep Learning for Document Summarization',
				month_year: '24th November 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/abstract/document/10421343'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: [
					'Rakshitha',
					'K Karthik',
					'Aishwarya D Shetty',
					'P Sowmya',
					'Rashmitha Shettigar'
				],
				title: 'Performance Analysis of Acoustic Scene Classification Using ANN and CNN Techniques',
				month_year: '25th November 2023',
				ranking: 'Q4',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'International Conference on Integrated Intelligence and Communication Systems (ICIICS)',
				link: 'https://ieeexplore.ieee.org/document/10421693'
			},
			{
				name: 'Ms. Rakshitha',
				designation: 'Assistant Professor',
				authors: ['Sudesh Rao', 'T Chiddananda', 'DN Disha', 'Rakshitha'],
				title:
					'Different Approaches To classify and predict the Diabetes of our current and future generation',
				month_year: '2023',
				ranking: 'Q4',
				impact_factor: '0.24',
				publisher: 'Latin America',
				indexed: 'Scopus',
				publisher_conference: '',
				journal: 'Latin American Journal of Pharmacy',
				conference: '',
				link: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=MojgT6wAAAAJ&citation_for_view=MojgT6wAAAAJ:YsMSGLbcyi4C'
			},
			{
				name: 'Ms. Swathi Pai M',
				designation: 'Assistant Professor',
				authors: [
					'Ranjeet Suryawanshi',
					'Annepu Arudra',
					'Dankan Gowda V',
					'Mathu Uthaman',
					'Swathi Pai M',
					'VK Satya Prasad'
				],
				title:
					'Innovations in Voice Navigation Using Objecy Detection to Empower the Visually Impaired',
				month_year: '29th-31st December 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'2023 3rd International Conference on Smart Generation Computing, Communication and Networking (SMART GENCON) Karnataka, India',
				link: 'https://doi.org/10.1109/SMARTGENCON60755.2023.10441962'
			},
			{
				name: 'Ms. Swathi Pai M',
				designation: 'Assistant Professor',
				authors: [
					'Swathi Pai M',
					'Annepu Arudra',
					'Dankan Gowda V',
					'Parashuram Shankar Vadar',
					'Mahadeo Ramchandra Jadhav',
					'Mandeep Kaur'
				],
				title:
					'Predictive Modeling of Dental Health Outcomes Based on Fluoride Concentrations using AI',
				month_year: '29th-31st December 2023',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal: '',
				conference:
					'2023 3rd International Conference on Smart Generation Computing, Communication and Networking (SMART GENCON) Karnataka, India',
				link: 'https://doi.org/10.1109/SMARTGENCON60755.2023.10441841'
			}
		]
	},
	{
		year: '2024',
		publications: [
			{
				name: 'Mr. Sudesh Rao',
				designation: 'Assistant Professor',
				authors: [
					'Sudesh Rao',
					'Taviti Naidu Gongada',
					'Huma Khan',
					'Rohit Anand',
					'Nidhi Sindhwani',
					'Ankur Gupta'
				],
				title: 'Advanced Deep Learning Integration for IoT Ecosystem for Content Classification',
				month_year: '14th-15th March 2024',
				ranking: '',
				impact_factor: '',
				publisher: '',
				indexed: 'Scopus',
				publisher_conference: 'IEEE',
				journal:
					'11th International Conference on Reliability, Infocom Technologies and Optimization (Trends and Future Directions) (ICRITO)',
				conference: 'International Conference on Mobile Networks and Wireless Communications',
				link: 'https://ieeexplore.ieee.org/document/9688512'
			}
		]
	}
];
const prisma = new PrismaClient();

async function seed() {

  try {
    for (const yearData of data) {
      const year = await prisma.year.create({
        data: {
          year: yearData.year,
        },
      });

      for (const publicationData of yearData.publications) {
        const publication = await prisma.publication.create({
          data: {
            name: publicationData.name,
            designation: publicationData.designation,
            title: publicationData.title,
            month_year: publicationData.month_year,
            ranking: publicationData.ranking,
            impact_factor: publicationData.impact_factor,
            publisher: publicationData.publisher,
            indexed: publicationData.indexed,
            publisher_conference: publicationData.publisher_conference,
            journal: publicationData.journal,
            conference: publicationData.conference,
            link: publicationData.link,
            yearId: year.id,
          },
        });

        for (const authorName of publicationData.authors) {
          await prisma.author.create({
            data: {
              name: authorName,
              publicationId: publication.id,
            },
          });
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error while seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();