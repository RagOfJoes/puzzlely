import { PropsWithChildren } from 'react';

import {
  Heading,
  HeadingProps,
  ListItem,
  Text,
  TextProps,
  UnorderedList,
} from '@chakra-ui/react';
import { ListProps } from '@chakra-ui/system';
import Link from 'next/link';

import DocLayout from '@/layouts/Doc';

const Title = (props: HeadingProps) => <Heading mt="12" size="md" {...props} />;

const Body = (props: TextProps) => <Text mt="4" {...props} />;

const List = (props: PropsWithChildren<ListProps>) => (
  <UnorderedList mt="4" pl="4" {...props} />
);

const PrivacyContainer = () => {
  return (
    <DocLayout title="Privacy Policy">
      <Text mt="12">
        Your privacy is important to us. It is Puzzlely&apos;s policy to respect
        your privacy and comply with any applicable law and regulation regarding
        any personal information we may collect about you, including across our
        website,{' '}
        <Link passHref href={process.env.NEXT_PUBLIC_HOST_URL || ''}>
          <Text as="a" color="primary" fontWeight="medium">
            {process.env.NEXT_PUBLIC_HOST_URL}
          </Text>
        </Link>
        , and other sites we own and operate.
      </Text>
      <Body>
        This policy is effect as of June 29, 2022 and was last updated on June
        29, 2022.
      </Body>

      <Title>Information We Collect</Title>
      <Body>
        Information we collect includes both information you knowingly and
        actively provide us when using or participating in any of our services
        and any information automatically sent by your device in the course of
        accessing our products and services.
      </Body>

      <Title>Log Data</Title>
      <Body>
        When you visit our website, our servers may automatically log the
        standard data provided by your web browser. It may include your device’s
        Internet Protocol (IP) address, your browser type and version, the pages
        you visit, the time and date of your visit, the time spent on each page,
        other details about your visit, and technical details that occur in
        conjunction with any errors you may encounter.
      </Body>

      <Title>Personal Information</Title>
      <Body>
        We may ask for personal information which may include one or more of the
        following:
      </Body>
      <List>
        <ListItem>Social media profiles</ListItem>
      </List>

      <Title>Legitimate Reasons for Processing Your Personal Information</Title>
      <Body>
        We only collect and use your personal information when we have a
        legitimate reason for doing so. In which instance, we only collect
        personal information that is reasonably necessary to provide our
        services to you.
      </Body>

      <Title>Collection and Use of Information</Title>
      <Body>
        We may collect personal information from you when you do any of the
        following on our website:
      </Body>
      <List>
        <ListItem>
          Use a mobile device or web browser to access our content
        </ListItem>
        <ListItem>
          Contact us via email, social media, or on any similar technologies
        </ListItem>
        <ListItem>When you mention us on social media</ListItem>
      </List>
      <Body>
        We may collect, hold, use, and disclose information for the following
        purposes, and personal information will not be further processed in a
        manner that is incompatible with these purposes:
      </Body>
      <List>
        <ListItem>
          for internal record keeping and administrative purposes
        </ListItem>
      </List>

      <Title>Children&apos;s Privacy</Title>
      <Body>
        We do not aim any of our products or services directly at children under
        the age of 13, and we do not knowingly collect personal information
        about children under 13.
      </Body>

      <Title>Disclosure of Personal Information to Third Parties</Title>
      <Body>We may disclose personal information to:</Body>
      <List>
        <ListItem>
          courts, tribunals, regulatory authorities, and law enforcement
          officers, as required by law, in connection with any actual or
          prospective legal proceedings, or in order to establish, exercise, or
          defend our legal rights
        </ListItem>
      </List>

      <Title>Use of Cookies</Title>
      <Body>
        We use &quot;cookies&quot; to collect information about you and your
        activity across our site. A cookie is a small piece of data that our
        website stores on your computer, and accesses each time you visit, so we
        can understand how you use our site. This helps us serve you content
        based on preferences you have specified.
      </Body>

      <Title>Limits of Our Policy</Title>
      <Body>
        Our website may link to external sites that are not operated by us.
        Please be aware that we have no control over the content and policies of
        those sites, and cannot accept responsibility or liability for their
        respective privacy practices.
      </Body>

      <Title>Changes to This Policy</Title>
      <Body>
        At our discretion, we may change our privacy policy to reflect updates
        to our business processes, current acceptable practices, or legislative
        or regulatory changes. If we decide to change this privacy policy, we
        will post the changes here at the same link by which you are accessing
        this privacy policy.
      </Body>

      <Title>Contact Us</Title>
      <Body>
        For any questions or concerns regarding your privacy, you may contact us
        using the following details:
      </Body>
      <Link passHref href="mailto:support@puzzlely.io">
        <Body as="a" color="primary" fontWeight="medium">
          support@puzzlely.io
        </Body>
      </Link>
    </DocLayout>
  );
};

export default PrivacyContainer;
