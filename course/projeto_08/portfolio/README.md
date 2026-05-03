# Portfolio - Distributed Systems Project on AWS

This project aims to practice distributed systems concepts by developing a landing page and publishing it on a lab subdomain in AWS.

## Project Goal

The proposal is to build a static landing page, host the application on AWS Amplify, and configure the domain for public access. In addition, the project includes DNS setup with Route 53 and site indexing through Google Search Console.

## Scope

- Develop a responsive landing page.
- Publish the application in an AWS environment.
- Configure a lab subdomain.
- Set up DNS with Route 53.
- Verify the domain in Google Search Console.
- Request indexing from search engines.

## Project Steps

### 1. Configure the landing page

At this stage, the page interface is developed with a focus on:

- Semantic HTML structure.
- Responsive styling.
- Organized visual components.
- Preparation of metadata for SEO and social sharing.

### 2. Publish through AWS Amplify

After the page is built, the project is deployed through AWS Amplify.

Main steps:

- Connect the repository to Amplify.
- Configure the publish directory.
- Validate static files.
- Run the initial deployment.
- Verify that the site is accessible correctly.

### 3. Configure DNS with Route 53

Once the site is published, the next step is to point the subdomain to the hosted application.

Main steps:

- Create or use a hosted zone in Route 53.
- Add the required DNS records.
- Configure the lab subdomain.
- Ensure proper domain propagation.

### 4. Configure the domain in Google Search Console and index it

Finally, the domain must be verified in Google Search Console to allow indexing.

Main steps:

- Add the domain property in Google Search Console.
- Confirm ownership using the available verification method.
- Submit the sitemap, if applicable.
- Request indexing for the homepage.
- Monitor coverage and crawl status.

## Project Structure

```text
src/
├── index.html
├── css/
│   ├── style.css
│   └── theme.css
├── js/
│   ├── script.js
│   └── i18n.js
├── assets/
│   └── images/
├── sitemap.xml
├── robots.txt
└── _redirects
```

## Deployment

The project was prepared for static hosting with AWS Amplify.

### Recommended flow

1. Commit the changes to the repository.
2. Connect the repository to AWS Amplify.
3. Run the automatic deployment.
4. Test navigation and static assets.
5. Validate the domain and DNS records.

## SEO and Indexing

To improve the page visibility:

- Define an appropriate title and description.
- Configure Open Graph metadata.
- Keep `robots.txt` and `sitemap.xml` updated.
- Ensure the site is accessible over HTTPS.

## Notes

- The project is intended for academic and practical purposes.
- Publishing in a lab environment makes it possible to test the integration between deployment, DNS, and indexing.
- In a future evolution, the project may include new sections, dynamic content, or backend integration.
