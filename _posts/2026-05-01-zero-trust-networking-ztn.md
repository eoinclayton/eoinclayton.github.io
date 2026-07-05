---
layout: post
title: Zero Trust Networking (ZTN)
date: 2026-05-01
---
Zero Trust Networking (ZTN) is a cybersecurity framework built on the principle of "never trust, always verify". Unlike legacy castle-and-moat models, it assumes attackers are already inside the network. It authenticates, authorises, and continuously validates every user, device, and application before granting access to resources.
## What did the older VPN based security model look like?
With the older VPN approach, you put in place a strong perimeter to try to stop attackers getting into your systems. However, if an attacker found a weak spot somewhere they would be inside the perimeter: ![](/assets/images/pasted-image-20260705110120.png)
## How is Zero Trust Networking different?
You can still have a perimeter, but with ZTN you don't require or trust that perimeter anymore. You instead put a perimeter on everything, adopting a "zero trust" mindset, trusting no-one. Every time a user wants to access an internal system, the user is verified to make sure they have access: ![](/assets/images/pasted-image-20260705110135.png)
## What does that mean in practice?
You no longer need a VPN or extensive networking experience.
You can also secure a website, or even part of a website on the internet.

E.g. you can secure:
* a staging website that you don't want random users to find
* a prod Admin website that should only be for company staff use
* parts of your website/API that should only be for your use, e.g. /admin/*

It's much more flexible and the good news is that it is [free to set up with Cloudflare](https://www.cloudflare.com/en-au/plans/zero-trust-services/)

> **Note:** ZTN is an evolving space within Cloudflare. I found that the various AIs including Gemini, Claude and Copilot all gave wrong information on how to set it up. I even found Cloudflare's own documentation was out of date. The following guide works mid-2026.
## How to enable in Cloudflare
1. Enable Zero Trust on your account. It will ask for a credit card, but it is free to use
2. Give your team a suitable name. It's going to be "{something}.cloudflareaccess.com", and the {something} name will be globally unique. E.g. "home" will probably already be taken.
3. You will need an identity provider to login with. Go to Integrations -> Identity Providers and add a suitable provider. You could start with the Cloudflare provided One-time PIN to get you going. Users will be sent a pin number to their email address when they hit your website ![](/assets/images/pasted-image-20260705110223.png)
4. In the web portal, navigate to Access Controls -> Applications and Add an Application ![](/assets/images/pasted-image-20260705110237.png)
5. My sites are Cloudflare hosted and I went with "Self hosted" and "Public DNS" ![](/assets/images/pasted-image-20260705110251.png)
6. In the following screen, add the hostnames and add an Access Policy to restrict to the allowed logins to be your expected email, or more usefully to emails that end in your email domain ![](/assets/images/pasted-image-20260705111419.png)
7. You can also set the Session Duration to something you can live with. Too short and it will be too annoying, too long and it might be less secure ![](/assets/images/pasted-image-20260705111445.png)
8. Try to hit your site. You should be prompted to login. Users who fail to login will be blocked ![](/assets/images/pasted-image-20260705110521.png)


> **Note — Include your .pages.dev sites if you are hosting via Cloudflare**
> Cloudflare provides .pages.dev versions of your site. Be sure to add those to ZTN, otherwise attackers will bypass ZTN via those pages.dev versions.


> **Note — Terraform**
> As part of good practices, you should explore using [Terraform to apply these settings](https://developers.cloudflare.com/cloudflare-one/api-terraform/). Given how the Cloudflare documentation was out of date, I didn't go down the Terraform route at this time but it's on the to-do list for the future.
