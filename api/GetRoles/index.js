// add role names to this object to map them to group ids in your AAD tenant
const roleGroupMappings = {
    'admin': 'd8a60c1d-1181-4954-a269-2740704caeca',
    'editor': '9406617a-e9bd-4083-9756-875054358e7e'
};

module.exports = async function (context, req) {
    const user = req.body || {};
    const roles = [];
    
    context.log(`GetRoles function received request: ${JSON.stringify(req)}`);

    for (const [role, groupId] of Object.entries(roleGroupMappings)) {
        if (await isUserInGroup(groupId, user.accessToken)) {
            roles.push(role);
        }
    }

    context.log(`User roles: ${roles.join(', ')}`);

    context.res.json({
        "roles": roles
    });
}

async function isUserInGroup(groupId, bearerToken) {
    const url = new URL('https://graph.microsoft.com/v1.0/me/memberOf');
    url.searchParams.append('$filter', `id eq '${groupId}'`);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`
        },
    });

    if (response.status !== 200) {
        return false;
    }

    const graphResponse = await response.json();
    const matchingGroups = graphResponse.value.filter(group => group.id === groupId);
    
    return matchingGroups.length > 0;
}