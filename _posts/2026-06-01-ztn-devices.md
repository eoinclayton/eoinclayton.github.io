---
layout: post
title: "ZTN: Devices"
date: 2026-06-01
---
In the previous Zero Trust Networking (ZTN) post, we saw how we can secure a website or even part of a website. Let's take it to the next level and require users to be on approved devices.
Only those users on company laptops (or your home laptop if you are an indie dev) will then be allowed to access the secured resources.

## The next level: auto-auth for trusted devices
1. In the Zero Trust area, Access Controls -> Access Settings and activate Enable authentication using Cloudflare One ![](/assets/images/pasted-image-20260705112017.png)
2. Go to your application in Access Controls -> Applications and enable Authenticate with Cloudflare One Client ![](/assets/images/pasted-image-20260705112030.png)
3. Next, add a "Device Posture" for Clients. This will enable users to login to your application with their logged in Cloudflare One Client. Go to Reusable Components -> Posture Checks ![](/assets/images/pasted-image-20260705112405.png)
4. ... and add a device posture check for Warp ![](/assets/images/pasted-image-20260705112417.png)
5. Next, add a new policy to your application so that users must have the Client installed and be logged in. Go to Access Controls -> Applications and add the policy ![](/assets/images/pasted-image-20260705112447.png)
6. Next, make it so that users must be part of your email domain to enroll their device. We don't want random users enrolling themselves. Devices -> Management -> Device enrolment permissions -> Manage. Add a Policy to restrict to your email domain only ![](/assets/images/pasted-image-20260705112530.png)
7. ... and for further peace of mind, restrict authentication to your configured identity provider only ![](/assets/images/pasted-image-20260705112542.png)
8. Install the Cloudflare One Client
	1. Go to Settings -> Downloads and download the latest release for your computer ![](/assets/images/pasted-image-20260705112556.png)
	2. Follow the setup guide by choosing Cloudflare One Client ![](/assets/images/pasted-image-20260705112605.png)
	3. It will ask you to login to your team, it will send you a one time pin and once you login, the Client is ready to go: ![](/assets/images/pasted-image-20260705112615.png)
	4. Just hit connect when you want to connect to your secure website ![](/assets/images/pasted-image-20260705112626.png)
	5. Best go to Devices on the web portal and verify your device appears
9. Then, when your client is disconnected, try to hit your website. You should see something similar to the following: ![](/assets/images/pasted-image-20260705112646.png)
10. Try to connect your client. You should end up on your website!
