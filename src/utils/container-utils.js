function getLinkedResources(container, type, resource) {
    const isProject = type === "project";
    let resources = [...container[resource]];
    let itContainer = isProject ? container.linkedStyleguide : container.parent;
    while (itContainer) {
        resources = [...resources, ...itContainer[resource]];
        itContainer = itContainer.parent;
    }

    return resources;
}

function getResources(container, type, useLinkedStyleguides, resourceKey) {
    if (useLinkedStyleguides) {
        return getLinkedResources(container, type, resourceKey);
    }

    return container[resourceKey];
}

function getResourceContainer(context) {
    if (context.styleguide) {
        return {
            container: context.styleguide,
            type: "styleguide"
        };
    }

    return {
        container: context.project,
        type: "project"
    };
}

export {
    getResources,
    getResourceContainer
};