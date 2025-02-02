import dns from "dns/promises";

const generateDomainVerificationRecord = (domain: string, projectId: string): string => {
    const uniqueHash = Buffer.from(`${domain}:${projectId}:${Date.now()}`).toString("base64");
    return `domain-verify=${domain},${uniqueHash}`;
};

const setupDomainData = async (
    domain: string,
    projectId: string,
    pb: any
): Promise<string> => {
    const verificationRecord = generateDomainVerificationRecord(domain, projectId);

    const deployment = await pb.collection("deployments").getOne(projectId);

    const updatedDomainData = {
        domains: [...(deployment.domain_data?.domains || []), domain],
        domain_status: "PENDING_VERIFICATION",
        verification_record: verificationRecord,
    };

    await pb.collection("deployments").update(projectId, {
        domain_data: updatedDomainData,
    });

    return verificationRecord;
};

const verifyDomainTXTRecord = async (domain: string, expectedValue: string): Promise<boolean> => {
    try {
        const records = await dns.resolveTxt(`_yourplatform.${domain}`);
        return records.some(record => record.includes(expectedValue));
    } catch (error) {
        console.error(`DNS verification failed for ${domain}:`, (error as any)?.message);
        return false;
    }
};

const performDomainVerification = async (pb: any) => {
    const pendingDeployments = await pb.collection("deployments").getFullList({
        filter: "domain_data.domain_status='PENDING_VERIFICATION'",
    });

    for (const deployment of pendingDeployments) {
        const { domains, verification_record } = deployment.domain_data;

        const verificationResults = await Promise.all(
            domains.map((domain: string) => verifyDomainTXTRecord(domain, verification_record))
        );

        const allVerified = verificationResults.every(result => result);

        await pb.collection("deployments").update(deployment.id, {
            domain_data: {
                ...deployment.domain_data,
                domain_status: allVerified ? "VERIFIED" : "PENDING_VERIFICATION",
            },
        });

        console.log(
            allVerified
                ? `All domains for deployment ${deployment.id} verified.`
                : `Some domains for deployment ${deployment.id} failed verification.`
        );
    }
};

export { generateDomainVerificationRecord, setupDomainData, performDomainVerification };