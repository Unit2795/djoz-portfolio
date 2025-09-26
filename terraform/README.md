# Terraform

If you need to update the Terraform lock file due to updating provider versions or something else, run the command below. Just ensure your Terraform CLI version meets or exceeds what is specified in the providers. This should save you from needing to set up the AWS CLI locally or anything else. Once completed, commit your updated lockfile to GitHub.

```
terraform init -upgrade -backend=false
```
