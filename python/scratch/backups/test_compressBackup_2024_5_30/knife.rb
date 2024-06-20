# See https://docs.getchef.com/config_rb_knife.html for more information on knife configuration options

current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                "danielljones79"
client_key               "#{current_dir}/danielljones79.pem"
chef_server_url          "https://ip-10-100-10-250.ec2.internal/organizations/production"
cookbook_path            ["#{current_dir}/../cookbooks"]
